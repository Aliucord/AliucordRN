/// <reference path="index.d.ts"/>
// @ts-ignore
(async () => {
    const {
        externalStorageDirectory,
        cacheDirectory,
        requestPermissions,
        checkPermissions
    } = nativeModuleProxy.AliucordNative;

    try {
        const granted = await checkPermissions();
        const constants = nativeModuleProxy.DialogManagerAndroid.getConstants();
        if (!granted) {
            const dialogResult = await new Promise<boolean>((res, rej) => {
                nativeModuleProxy.DialogManagerAndroid.showAlert({
                    title: "Storage Permissions",
                    message: "Aliucord needs access to your storage to load plugins and themes.",
                    cancelable: true,
                    buttonPositive: "Ok",
                    buttonNegative: "Cancel"
                }, rej, (action, key) => {
                    if (action === constants.buttonClicked && key === constants.buttonPositive) res(true);
                    else res(false);
                });
            });
            if (!(dialogResult && await requestPermissions())) {
                nativeModuleProxy.DialogManagerAndroid.showAlert({
                    title: "Storage Permissions",
                    message: "Access to your storage is required for aliucord to load.",
                    cancelable: true,
                    buttonPositive: "Ok"
                }, () => null, () => null);
                return;
            }
        }

        const aliucordDir = `${externalStorageDirectory}/AliucordRN`;
        AliuFS.mkdir(aliucordDir);

        const externalBundlePath = `${aliucordDir}/Aliucord.js.bundle`;
        if (AliuFS.exists(externalBundlePath)) {
            globalThis.aliucord = AliuHermes.run(externalBundlePath);
            return;
        }

        const bundlePrefix = "Aliucord.js.bundle.";
        const bundles = AliuFS.readdir(cacheDirectory)
            .filter(f => f.type == "file" && f.name.startsWith(bundlePrefix))
            .map(f => f.name);
        const bundleETags = bundles.map(b => b.slice(bundlePrefix.length));

        const bundleResponse = await fetch("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", {
            headers: {
                "If-None-Match": bundleETags
                    .map(tag => `"${tag}"`)
                    .join(", ")
            }
        });

        if (!(bundleResponse.status in [200, 304])) {
            throw new Error(`Failed to fetch Aliucord bundle: ${bundleResponse.status} ${await bundleResponse.text()}`);
        }

        const eTag = bundleResponse.headers.get("etag")?.replaceAll("\"", "");
        const internalBundlePath = `${cacheDirectory}/Aliucord.js.bundle.${eTag}`;
        if (!eTag || eTag.includes(",") || eTag.startsWith("W/") || !bundleETags.includes(eTag)) {
            // GitHub doesn't return multiple ETags or weak validators so if it ever starts doing then fix
            throw new Error("Unknown ETag");
        }

        // status 304 (unmodified) falls through
        if (bundleResponse.status === 200) {
            bundles.forEach(b => AliuFS.remove(`${cacheDirectory}/${b}`));
            AliuFS.writeFile(internalBundlePath, await bundleResponse.arrayBuffer());
        }

        globalThis.aliucord = AliuHermes.run(internalBundlePath);
    } catch (error) {
        nativeModuleProxy.DialogManagerAndroid.showAlert({
            title: "Error",
            message: "Something went wrong while loading aliucord, check logs for the specific error.",
            cancelable: true,
            buttonPositive: "Ok"
        }, () => null, () => null);
        console.error((error as Error).stack);
    }
})();

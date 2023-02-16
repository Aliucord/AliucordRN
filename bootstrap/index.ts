/// <reference path="index.d.ts"/>
import "./arrayBuffer.js";

(async () => {
    const {
        externalStorageDirectory,
        cacheDirectory,
        requestPermissions,
        restartApp,
        checkPermissions,
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

        if (Number(nativeModuleProxy.InfoDictionaryManager.Build) == 165015) {
            nativeModuleProxy.DialogManagerAndroid.showAlert({
                title: "Unsupported Discord version",
                message: `Aliucord does not support this version of Discord: ${nativeModuleProxy.InfoDictionaryManager.Version} (${nativeModuleProxy.InfoDictionaryManager.Build}). Things might break on this version, use at your own risk.`,
                cancelable: true,
                buttonPositive: "Ok"
            }, () => null, () => null);
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

        // noinspection ES6MissingAwait
        (async () => {
            try {
                const bundleResponse = await fetch("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", {
                    headers: {
                        // !! returns a different ETag (weak-validator) !!
                        "Accept-Encoding": "gzip",
                        "If-None-Match": bundles
                            .map(b => b.slice(bundlePrefix.length))
                            .map(tag => `"${tag}"`)
                            .join(", "),
                    },
                });

                if (!bundleResponse.ok && bundleResponse.status !== 304) {
                    throw new Error(`Error response: ${bundleResponse.status} ${await bundleResponse.text()}`);
                }

                const eTag = bundleResponse.headers.get("etag")
                    ?.replaceAll("\"", "")
                    .replace("W/", "");
                if (!eTag || eTag.includes(",")) {
                    // GitHub doesn't return multiple ETags so if it ever starts doing then fix
                    throw new Error(`Unknown ETag ${eTag}`);
                }

                // status 304 (unmodified) falls through
                if (bundleResponse.status === 200) {
                    const internalBundlePath = `${cacheDirectory}/Aliucord.js.bundle.${eTag}`;
                    bundles.forEach(b => AliuFS.remove(`${cacheDirectory}/${b}`));
                    AliuFS.writeFile(internalBundlePath, await bundleResponse.arrayBuffer());
                    restartApp();
                }
            } catch (e) {
                console.error("Failed to fetch Aliucord bundle");
                console.error((e as Error)?.stack ?? e);

                nativeModuleProxy.DialogManagerAndroid.showAlert({
                    title: "Error",
                    message: bundles.length > 0 ?
                        "Failed to fetch update info! Loaded existing Aliucord, which may be outdated! You have been warned." :
                        "Failed to fetch Aliucord! Please check your internet connection and try again.",
                    cancelable: true,
                    buttonPositive: "Ok"
                }, () => null, () => null);
            }
        })();

        if (bundles.length > 0) {
            globalThis.aliucord = AliuHermes.run(`${cacheDirectory}/${bundles[0]}`);
        }
    } catch (error) {
        console.error("Failed to load Aliucord bundle");
        console.error((error as Error)?.stack ?? error);

        nativeModuleProxy.DialogManagerAndroid.showAlert({
            title: "Error",
            message: "Something went wrong while loading Aliucord! Please check the logs for more details."
                + (error as Error)?.message ? ` Error message: ${(error as Error).message}` : "",
            cancelable: true,
            buttonPositive: "Ok"
        }, () => null, () => null);
    }
})();

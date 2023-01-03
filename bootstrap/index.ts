
(async () => {
    const { externalStorageDirectory, codeCacheDirectory, requestPermissions, download, checkPermissions } = nativeModuleProxy.AliucordNative;
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

        let latest_file = "";

        for (const file of AliuFS.readdir(codeCacheDirectory)) {
            if (!file.name.endsWith(".bundle") && !file.name.startsWith("Aliucord.")) continue;

            latest_file = file.name;
            break;
        }

        const is_latest = await fetch("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", {
            headers: {
                "If-None-Match": `"${latest_file.replace("Aliucord.", "").replace(".js.bundle", "")}"`
            }
        });

        if (is_latest.status === 304) {
            const internalBundlePath = `${codeCacheDirectory}/${latest_file}`;

            globalThis.aliucord = AliuHermes.run(internalBundlePath);
            return;
        }

        const etag = is_latest.headers.get("etag")?.replaceAll('"', "").replace("W/", "");

        const internalBundlePath = `${codeCacheDirectory}/Aliucord.${etag}.js.bundle`;
        console.log(internalBundlePath);
        if (!AliuFS.exists(internalBundlePath)) await download("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", internalBundlePath);

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


(async () => {
    const { externalStorageDirectory, cacheDirectory, requestPermissions, download, checkPermissions } = nativeModuleProxy.AliucordNative;
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

        const files: string[] = [];

        for (const file of AliuFS.readdir(cacheDirectory)) {
            if (!file.name.endsWith(".bundle") && !file.name.startsWith("Aliucord.")) continue;

            files.push(file.name);
        }

        const is_latest = await fetch("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", {
            headers: {
                "If-None-Match": `"${files.length !== 0 ? files[0].replace("Aliucord.", "").replace(".js.bundle", "") : ''}"`
            }
        });

        if (is_latest.status === 304) {
            const internalBundlePath = `${cacheDirectory}/${files[0]}`;

            globalThis.aliucord = AliuHermes.run(internalBundlePath);
            return;
        }

        for (const file in files)
            AliuFS.remove(`${cacheDirectory}/${file}`);

        const etag = is_latest.headers.get("etag")?.replaceAll('"', "").replace("W/", "");

        const internalBundlePath = `${cacheDirectory}/Aliucord.${etag}.js.bundle`;
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

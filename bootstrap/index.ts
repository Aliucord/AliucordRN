
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

        const commits = await fetch("https://api.github.com/repos/Aliucord/AliucordRN/commits?sha=builds&path=Aliucord.js.bundle&per_page=1");
        if (commits.status !== 200) {
            const internalBundlePath = `${codeCacheDirectory}/Aliucord.js.bundle`;
            await download("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", internalBundlePath);
            globalThis.aliucord = AliuHermes.run(internalBundlePath);
            const body = await commits.text();
            nativeModuleProxy.DialogManagerAndroid.showAlert({
                title: "Error",
                message: body,
                cancelable: true,
                buttonPositive: "Ok"
            }, () => null, () => null);
            return;
        }
        const json = await commits.json();
        const latestCommit = json[0].sha;

        const internalBundlePath = `${codeCacheDirectory}/Aliucord.${latestCommit}.js.bundle`;
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

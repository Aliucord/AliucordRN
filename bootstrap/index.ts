(async () => {
    const { externalStorageDirectory, requestPermissions, download, checkPermissions } = nativeModuleProxy.AliucordNative;
    async function downloadAliucord() {
        const bundlePath = externalStorageDirectory + "/AliucordRN/Aliucord.js.bundle";
        if (!AliuFS.exists(bundlePath)) {
            try {
                await download("https://raw.githubusercontent.com/Aliucord/AliucordRN/builds/Aliucord.js.bundle", bundlePath);
            } catch (error) {
                alert("Failed to download Aliucord.js.bundle");
                throw error;
            }
        }

        (globalThis._globals ??= {}).aliucord = AliuHermes.run(bundlePath);
    }
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
                    cancelable: false
                }, () => { }, () => { });
                return;
            }
        }
        await downloadAliucord();
    } catch (error) {
        nativeModuleProxy.DialogManagerAndroid.showAlert({
            title: "Error",
            message: "Something went wrong while loading aliucord, check logs for the specific error.",
            cancelable: false
        }, () => { }, () => { });
        console.error((error as Error).stack);
    }
})();

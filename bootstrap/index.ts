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
        const granted = await checkPermissions()
        if (!granted) {
            const dialogResult = await new Promise((res, rej) => {
                window.nativeModuleProxy.DialogManagerAndroid.showAlert({
                    title: "Storage Permissions",
                    message: "Aliucord needs access to your storage to load plugins and themes.",
                    cancellable: true,
                    buttonPositive: "Open"
                }, rej, action => {
                    if (action === constants.buttonClicked) res(true);
                    else res(false);
                });
            })
            if (dialogResult) {
                alert("Access to your storage is required for aliucord to load.");
                return;
            }
            const permissionsGranted = await requestPermissions();
            if (!permissionsGranted) {
                alert("Access to your storage is required for aliucord to load.");
                return;
            }
        }
        await downloadAliucord();
    } catch (error) {
        alert("Something went wrong :(\nCheck logs");
        console.error((error as Error).stack);
    }
})();

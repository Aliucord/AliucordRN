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
            alert("Aliucord needs access to your storage to load plugins and themes.");
            const permissionsGranted = await requestPermissions();
            if (!permissionsGranted) alert("Unable to load Aliucord, Aliucord needs access to your storage to load plugins and themes.");
        }
        await downloadAliucord();
    } catch (error) {
        alert("Something went wrong :(\nCheck logs");
        console.error((error as Error).stack);
    }
})();

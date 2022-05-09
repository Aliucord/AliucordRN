(async () => {
    async function loadAliucord() {
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
        const { externalStorageDirectory, requestPermissions, download, checkPermissions } = nativeModuleProxy.AliucordNative;
        const granted = await checkPermissions()
        if (!granted) Metro.ReactNative.Alert.alert(
            "Storage Access",
            "Aliucord needs access to your storage to load plugins and themes.",
            [{
                text: "OK",
                onPress: () => requestPermissions().then(permissionGranted => {
                    if (permissionGranted) loadAliucord();
                    else alert("Unable to load, Aliucord needs access to your storage to load plugins and themes.");
                })
            }]
        );
        else await loadAliucord();
    } catch (error) {
        alert("Something went wrong :(\nCheck logs");
        console.error((error as Error).stack);
    }
})();

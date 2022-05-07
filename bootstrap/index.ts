(async () => {
    try {
        const { externalStorageDirectory, download } = nativeModuleProxy.AliucordNative;
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
    } catch (error) {
        alert("Something went wrong :(\nCheck logs");
        console.error((error as Error).stack);
    }
})();

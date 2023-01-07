import { logger } from "../Aliucord";
import { currentTheme, themeApplied, themeErrorReason } from "../api/Themer";
import { AMOLEDThemeManager, Dialog, FluxDispatcher, ReactNative, ThemeManager, ThemeStore, UnsyncedUserSettingsStore } from "../metro";

export default function patchTheme() {
    if (!themeApplied && themeErrorReason) {
        logger.error("Failed to apply theme: ", themeErrorReason);
        Dialog.show({
            title: "Failed to apply theme",
            body: `${currentTheme?.name} failed to apply. Theme will be disabled on restart.`,
            isDismissable: false,
            cancelText: "Do not restart",
            confirmText: "Restart",
            onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
        });

        window.Aliucord.settings.set("theme", "");
    } else if (themeApplied) {
        logger.log("Applied theme: ", currentTheme.name);
    }

    try {
        // 'I18N_LOAD_START' dispatch is the best time I can find to override the theme without breaking it.
        // Therefore, there's no guarantee that this will fix it for everyone
        logger.info("Patching theme...");
        if (ThemeStore) {
            const overrideTheme = () => {
                ThemeManager.overrideTheme(ThemeStore.theme ?? "dark");
                logger.info(`Overrode theme to ${ThemeStore.theme ?? "dark"}`);

                if (AMOLEDThemeManager) {
                    if (UnsyncedUserSettingsStore.useAMOLEDTheme === 2) {
                        AMOLEDThemeManager.setAMOLEDThemeEnabled(true);
                        logger.info("Enabled AMOLED theme");
                    }
                }
                FluxDispatcher.unsubscribe("I18N_LOAD_START", overrideTheme);
            };

            FluxDispatcher.subscribe("I18N_LOAD_START", overrideTheme);
        } else {
            logger.error("Could not get ThemeStore");
        }
    } catch (err) {
        logger.error("Failed to patch theme", err);
    }
}

import { logger } from "../Aliucord";
import { AMOLEDThemeManager, FluxDispatcher, ThemeManager, ThemeStore, UnsyncedUserSettingsStore } from "../metro";

export default function patchTheme() {
    logger.info("Patching theme...");

    try {
        // 'I18N_LOAD_START' dispatch is the best time I can find to override the theme without breaking it.
        // Therefore, there's no guarantee that this will fix it for everyone
        if (ThemeStore) {
            const overrideTheme = () => {
                ThemeManager.overrideTheme(ThemeStore.theme ?? "dark");
                logger.info(`Overrode theme to ${ThemeStore.theme ?? "dark"}`);

                if (AMOLEDThemeManager) {
                    if (UnsyncedUserSettingsStore.useAMOLEDTheme === 2) {
                        AMOLEDThemeManager.enableAMOLEDThemeOption();
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

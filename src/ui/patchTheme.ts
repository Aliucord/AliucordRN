import { logger } from "../Aliucord";
import { AMOLEDThemeManager, FluxDispatcher, ThemeManager, ThemeStore } from "../metro";
import { patcher } from "../utils";

export default function patchTheme() {
    logger.info("Patching theme...");

    try {
        // Can't figure out where the AMOLED theme toggle is stored, so we'll just store it in Aliucord's settings
        if (AMOLEDThemeManager) {
            if (window.Aliucord.settings.get("enableAMOLEDTheme", false)) {
                AMOLEDThemeManager.enableAMOLEDThemeOption();
                logger.info("Enabled AMOLED theme");
            }

            patcher.before(AMOLEDThemeManager, "setAMOLEDThemeEnabled", (_, enabled) => {
                logger.info(`Setting AMOLED theme to ${enabled}`);
                window.Aliucord.settings.set("enableAMOLEDTheme", enabled);
            });
        } else {
            logger.error("Could not get AMOLEDThemeManager");
        }

        // 'I18N_LOAD_START' dispatch is the best time I can find to override the theme without breaking it.
        // Therefore, there's no guarantee that this will fix it for everyone
        if (ThemeStore) {
            const overrideTheme = () => {
                ThemeManager.overrideTheme(ThemeStore.theme ?? "dark");
                logger.info(`Overrode theme to ${ThemeStore.theme ?? "dark"}`);
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

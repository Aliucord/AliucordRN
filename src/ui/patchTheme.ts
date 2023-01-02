import { logger } from "../Aliucord";
import { AMOLEDThemeManager, FluxDispatcher, getByProps, ThemeManager, ThemeStore } from "../metro";

export default function patchTheme() {
    logger.info("Patching theme...");

    const AMOLEDState = getByProps("useAMOLEDTheme").useAMOLEDTheme;
    try {
        // Can't figure out where the AMOLED theme toggle is stored, so we'll just store it in Aliucord's settings
        if (AMOLEDThemeManager) {
            if (AMOLEDState === 2) {
                AMOLEDThemeManager.enableAMOLEDThemeOption();
                logger.info("Enabled AMOLED theme");
            }
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

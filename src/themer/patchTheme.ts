import { logger } from "../Aliucord";
import { onStartup } from "../api/Themer";
import { AMOLEDThemeManager, AMOLEDThemeState, FluxDispatcher, setAMOLEDThemeEnabledBypass, ThemeManager, ThemeStore, UnsyncedUserSettingsStore } from "../metro";
import { themeState } from "./themerInit";

export default function patchTheme() {
    try {
        // Handle custom theme info which was not possible during themer initialization
        onStartup();

        // 'I18N_LOAD_START' dispatch is the best time I can find to override the theme without breaking it.
        // Therefore, there's no guarantee that this will fix it for everyone
        logger.info("Patching theme...");
        if (ThemeStore) {
            const overrideTheme = () => {
                ThemeManager.overrideTheme(ThemeStore.theme ?? "dark");
                logger.info(`Overrode theme to ${ThemeStore.theme ?? "dark"}`);

                if (AMOLEDThemeManager) {
                    if (themeState.isApplied && themeState.noAMOLED) {
                        setAMOLEDThemeEnabledBypass(false);
                        logger.info("Disabled AMOLED theme as it's unsupported by current custom theme.");
                    } else if (UnsyncedUserSettingsStore.useAMOLEDTheme === AMOLEDThemeState.ON) {
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

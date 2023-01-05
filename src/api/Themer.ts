import { Theme } from "../entities";
import { Constants, Dialog, getByName, ReactNative, setAMOLEDThemeEnabledBypass } from "../metro";
import { readdir } from "../native/fs";
import { Logger } from "../utils";
import { THEME_DIRECTORY } from "../utils/constants";
import { after } from "../utils/patcher";

const logger = new Logger("Themer");
export const themes = {} as Record<string, Theme>;
export let currentTheme: Theme;

enum ThemeType {
    DARK,
    LIGHT,
    AMOLED
}

export function setTheme(theme: Theme) {
    window.Aliucord.settings.set("theme", theme.name);
    currentTheme = theme;
    applyTheme();
}

export function applyTheme() {
    if (currentTheme === undefined) return;
    setAMOLEDThemeEnabledBypass(false);
    for (const key in Constants.ThemeColorMap) {
        Constants.ThemeColorMap[key][ThemeType.AMOLED] = Constants.ThemeColorMap[key][ThemeType.DARK];
        if (currentTheme.theme_color_map[key]) {
            Constants.ThemeColorMap[key][ThemeType.AMOLED] = currentTheme.theme_color_map[key]?.[ThemeType.DARK];
            Constants.ThemeColorMap[key][ThemeType.LIGHT] = currentTheme.theme_color_map[key]?.[ThemeType.LIGHT];
            Constants.ThemeColorMap[key][ThemeType.DARK] = currentTheme.theme_color_map[key]?.[ThemeType.DARK];
        }
    }

    for (const key in currentTheme.colors) {
        Constants.Colors[key] = currentTheme.colors[key];
    }

    if (currentTheme.unsafe_colors && !currentTheme.theme_color_map["CHAT_BACKGROUND"]) {
        Constants.ThemeColorMap.CHAT_BACKGROUND[ThemeType.AMOLED] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][ThemeType.DARK];
        Constants.ThemeColorMap.CHAT_BACKGROUND[ThemeType.LIGHT] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][ThemeType.LIGHT];
        Constants.ThemeColorMap.CHAT_BACKGROUND[ThemeType.DARK] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][ThemeType.DARK];
    }

    setAMOLEDThemeEnabledBypass(true);
    logger.info("Theme applied: ", currentTheme.name);
}

export function themerInit() {
    // Only those two are used
    AliuHermes.unfreeze(Constants.ThemeColorMap);
    AliuHermes.unfreeze(Constants.Colors);

    for (const file of readdir(THEME_DIRECTORY)) {
        if (!file.name.endsWith(".json")) continue;

        const themeFile = JSON.parse(AliuFS.readFile(THEME_DIRECTORY + file.name, "text") as string) as Theme;
        themes[themeFile.name] = themeFile;
    }

    if (themes[window.Aliucord.settings.get("theme", "")] !== undefined) {
        currentTheme = themes[window.Aliucord.settings.get("theme", "")];

        // Chat Input background
        after(getByName("ChatInput").default.prototype, "render", (_, comp) => {
            if (currentTheme === undefined) return;

            comp.props.children[2].props.children.props.style[0].backgroundColor = currentTheme.theme_color_map["BACKGROUND_MOBILE_SECONDARY"][ThemeType.DARK];
        });

        // Navigation Bar
        after(getByName("ChannelSafeAreaBottom"), "default", (_, comp) => {
            if (currentTheme === undefined) return;

            comp.props.style.backgroundColor = currentTheme.theme_color_map["BACKGROUND_MOBILE_SECONDARY"][ThemeType.DARK];
        });

        applyTheme();
    } else {
        window.Aliucord.settings.set("theme", "");
    }
} 

export function useDiscordThemes() {
    window.Aliucord.settings.set("theme", "");

    logger.info("Using Discord's themes");
    Dialog.show({
        title: "Restart to apply",
        body: "Restart the app for Discord to use its own themes.",
        confirmText: "Restart",
        isDismissable: false,
        onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
    });
}

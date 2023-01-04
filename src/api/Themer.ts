import { Theme } from "../entities";
import { AMOLEDThemeManager, Constants, getByName } from "../metro";
import { readdir } from "../native/fs";
import { Logger } from "../utils";
import { THEME_DIRECTORY } from "../utils/constants";
import { after } from "../utils/patcher";

const logger = new Logger("Themer");
export const themes = {} as Record<string, Theme>;
export let currentTheme: Theme;

export function setTheme(theme: Theme) {
    window.Aliucord.settings.set("theme", theme.name);
    currentTheme = theme;
    applyTheme();
}

export function applyTheme() {
    if (currentTheme === undefined) return;
    AMOLEDThemeManager.setAMOLEDThemeEnabled(false);
    for (const key in Constants.ThemeColorMap) {
        Constants.ThemeColorMap[key][2] = Constants.ThemeColorMap[key][0];
        if (currentTheme.theme_color_map[key]) {
            // 0 = Dark, 1 = Light, 2 = AMOLED
            Constants.ThemeColorMap[key][2] = currentTheme.theme_color_map[key]?.[0];
            Constants.ThemeColorMap[key][1] = currentTheme.theme_color_map[key]?.[1];
            Constants.ThemeColorMap[key][0] = currentTheme.theme_color_map[key]?.[0];
        }
    }

    for (const key in currentTheme.colors) {
        Constants.Colors[key] = currentTheme.colors[key];
    }

    if (currentTheme.unsafe_colors && !currentTheme.theme_color_map["CHAT_BACKGROUND"]) {
        Constants.ThemeColorMap.CHAT_BACKGROUND[2] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][0];
        Constants.ThemeColorMap.CHAT_BACKGROUND[1] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][1];
        Constants.ThemeColorMap.CHAT_BACKGROUND[0] = currentTheme.theme_color_map["BACKGROUND_PRIMARY"][0];
    }

    AMOLEDThemeManager.setAMOLEDThemeEnabled(true);
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

    currentTheme = themes[window.Aliucord.settings.get("theme", "")];

    // Chat Input background
    after(getByName("ChatInput").default.prototype, "render", (_, comp) => {
        if (currentTheme === undefined) return;

        comp.props.children[2].props.children.props.style[0].backgroundColor = currentTheme.theme_color_map["BACKGROUND_MOBILE_SECONDARY"][0];
    });

    // Navigation Bar
    after(getByName("ChannelSafeAreaBottom"), "default", (_, comp) => {
        if (currentTheme === undefined) return;

        comp.props.style.backgroundColor = currentTheme.theme_color_map["BACKGROUND_MOBILE_SECONDARY"][0];
    });

    applyTheme();
} 

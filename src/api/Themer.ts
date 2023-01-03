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
    currentTheme = theme;
    applyTheme();
}

export function applyTheme() {
    AMOLEDThemeManager.setAMOLEDThemeEnabled(false);
    window.Aliucord.settings.set("theme", currentTheme.name);
    for (const key in Constants.ThemeColorMap) {
        Constants.ThemeColorMap[key][2] = Constants.ThemeColorMap[key][0];
        if (currentTheme.theme_color_map[key]) {
            Constants.ThemeColorMap[key][2] = currentTheme.theme_color_map[key]?.[0];
            Constants.ThemeColorMap[key][1] = currentTheme.theme_color_map[key]?.[1];

            logger.info("Patched theme color", key);
        }
    }

    for (const key in currentTheme.colors) {
        Constants.Colors[key] = currentTheme.colors[key];
    }

    AMOLEDThemeManager.enableAMOLEDThemeOption();
}

export function themerInit() {
    currentTheme = themes[window.Aliucord.settings.get("theme", "")];

    // Only those two are used
    AliuHermes.unfreeze(Constants.ThemeColorMap);
    AliuHermes.unfreeze(Constants.Colors);

    for (const file of readdir(THEME_DIRECTORY)) {
        if (!file.name.endsWith(".json")) continue;

        const themeFile = JSON.parse(AliuFS.readFile(THEME_DIRECTORY + file.name, "text") as string) as Theme;
        themes[themeFile.name] = themeFile;
    }

    after(getByName("ChatInput").default.prototype, "render", (_, comp) => {
        if (currentTheme === undefined) return;

        console.log(currentTheme.name);
        comp.props.children[2].props.children.props.style[0].backgroundColor = currentTheme.theme_color_map["BACKGROUND_SECONDARY"][1];
    });

    // Navigation Bar
    after(getByName("ChannelSafeAreaBottom"), "default", (_, comp) => {
        if (currentTheme === undefined) return;
        console.log(currentTheme.name);
        comp.props.style.backgroundColor = currentTheme.theme_color_map["BACKGROUND_SECONDARY"][1];
    });

    applyTheme();
} 

import { Theme } from "../entities";
import { AMOLEDThemeManager, Constants, getByName } from "../metro";
import { readdir } from "../native/fs";
import { Logger } from "../utils";
import { THEME_DIRECTORY } from "../utils/constants";
import { after } from "../utils/patcher";

const logger = new Logger("Themer");
export const themes = {} as Record<string, Theme>;

export function applyTheme(theme: Theme) {
    AMOLEDThemeManager.setAMOLEDThemeEnabled(false);
    window.Aliucord.settings.set("theme", theme.name);
    for (const key in Constants.ThemeColorMap) {
        Constants.ThemeColorMap[key][2] = Constants.ThemeColorMap[key][0];
        if (theme.theme_color_map[key]) {
            Constants.ThemeColorMap[key][2] = theme.theme_color_map[key]?.[0];
            Constants.ThemeColorMap[key][1] = theme.theme_color_map[key]?.[1];

            logger.info("Patched theme color", key);
        }
    }

    for (const key in theme.colors) {
        Constants.Colors[key] = theme.colors[key];
    }

    // Chat Box
    after(getByName("ChatInput").default.prototype, "render", (_, comp) => {
        comp.props.children[2].props.children.props.style[0].backgroundColor = theme.theme_color_map["BACKGROUND_SECONDARY"][1];
    });

    // Navigation Bar
    after(getByName("ChannelSafeAreaBottom"), "default", (_, comp) => {
        comp.props.style.backgroundColor = theme.theme_color_map["BACKGROUND_SECONDARY"][1];
    });

    AMOLEDThemeManager.enableAMOLEDThemeOption();
}

export function themerInit() {
    const currentTheme = window.Aliucord.settings.get("theme", "");

    // Only those two are used
    AliuHermes.unfreeze(Constants.ThemeColorMap);
    AliuHermes.unfreeze(Constants.Colors);

    for (const file of readdir(THEME_DIRECTORY)) {
        if (!file.name.endsWith(".json")) continue;

        const themeFile = JSON.parse(AliuFS.readFile(THEME_DIRECTORY + file.name, "text") as string) as Theme;
        themes[themeFile.name] = themeFile;
    }
    console.log(currentTheme);
    if (themes[currentTheme] !== undefined)
        applyTheme(themes[currentTheme]);
} 

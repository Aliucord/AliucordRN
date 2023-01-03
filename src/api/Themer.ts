import { Theme } from "../entities";
import { Constants, getByName, AMOLEDThemeManager } from "../metro";
import { readdir } from "../native/fs";
import { Logger } from "../utils";
import { THEME_DIRECTORY } from "../utils/constants";
import { after } from "../utils/patcher";

const logger = new Logger("Themer");

export function themerInit() {

    // Only those two are used
    AliuHermes.unfreeze(Constants.ThemeColorMap);
    AliuHermes.unfreeze(Constants.Colors);

    for (const file of readdir(THEME_DIRECTORY)) {
        if (!file.name.endsWith(".json")) continue;

        const themeFile = JSON.parse(AliuFS.readFile(THEME_DIRECTORY + file.name, "text") as string) as Theme;

        for (const key in Constants.ThemeColorMap) {
            Constants.ThemeColorMap[key][2] = Constants.ThemeColorMap[key][0];
            if (themeFile.theme_color_map[key]) {
                Constants.ThemeColorMap[key][2] = themeFile.theme_color_map[key]?.[0];
                Constants.ThemeColorMap[key][1] = themeFile.theme_color_map[key]?.[1];

                logger.info("Patched theme color", key);
            }
        }

        for (const key in themeFile.colors) {
            Constants.Colors[key] = themeFile.colors[key];
        }

        // Chat Box
        after(getByName("ChatInput").default.prototype, "render", (_, comp) => {
            comp.props.children[2].props.children.props.style[0].backgroundColor = themeFile.theme_color_map["BACKGROUND_SECONDARY"][1];
        });

        // Navigation Bar
        after(getByName("ChannelSafeAreaBottom"), "default", (_, comp) => {
            comp.props.style.backgroundColor = themeFile.theme_color_map["BACKGROUND_SECONDARY"][1];
        });

        AMOLEDThemeManager.enableAMOLEDThemeOption();
    }
} 

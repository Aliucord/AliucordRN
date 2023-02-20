import { Theme } from "./entities";

export enum ThemeErrors {
    NO_SETTINGS = "Themes are loaded, but settings wasn't found",
    UNKNOWN_THEME = "Unknown theme applied, reverting to default",
    UNEXPECTED_ERROR = "Unexpected error",
    THEME_UNSET = "Theme is unset",
    NO_THEME_DIRECTORY = "Theme directory not found",
}

type ThemeConstants = {
    ThemeColorMap: Record<string, [string, string, string?]>;
    Colors: Record<string, string>;
    UNSAFE_Colors: Record<string, string>;
};

type ColorMap = {
    RawColor: Record<string, string>;
    SemanticColor: Record<string, string>; // (position -> color), (color -> position)
    SemanticColorsByThemeTable: [Record<number, string>, Record<number, string>, Record<number, string>]; // [light, dark, amoled?]
};

let Constants: ThemeConstants;
let DiscordColorMap: ColorMap;

const { externalStorageDirectory } = window.nativeModuleProxy.AliucordNative;
const SETTINGS_DIRECTORY = externalStorageDirectory + "/AliucordRN/settings/";
const THEME_DIRECTORY = externalStorageDirectory + "/AliucordRN/themes/";

export const excludedThemes = {
    invalidThemes: [] as InvalidTheme[],
    duplicatedThemes: [] as string[]
};

export type InvalidTheme = {
    name: string;
    reason: string;
};

// These are handled after Aliucord loads
export let themeState = {} as {
    isApplied: true;
    currentTheme: string;
    noAMOLED: boolean;
} | {
    isApplied: false;
    anError: boolean;
    currentTheme?: string;
    reason?: ThemeErrors;
    errorArgs?: any[];
};

export const loadedThemes: Theme[] = [];

export function themerInit(constants: ThemeConstants, colorMap: ColorMap) {
    Constants = constants;
    DiscordColorMap = colorMap;

    unfreezeThemeConstants();
    handleThemeApply();
}

function handleThemeApply() {
    try {
        if (!loadThemes()) return;
        const themeName = getTheme();

        // File doesn't exist or theme isn't set
        if (!themeName) return;

        const theme: Theme = loadedThemes[themeName];
        if (!theme) {
            themeState = {
                isApplied: false,
                currentTheme: themeName,
                anError: true,
                reason: ThemeErrors.UNKNOWN_THEME
            };
            return;
        }

        // overwrite color map
        overwriteColors(DiscordColorMap.SemanticColorsByThemeTable, theme.theme_color_map);
        overwriteColors(DiscordColorMap.RawColor, theme.colors ?? theme.colours);
        overwriteColors(Constants.UNSAFE_Colors, theme.unsafe_colors);

        themeState = {
            currentTheme: themeName,
            isApplied: true,
            // Check if AMOLED is not supported. If so, automatically turn off AMOLED.
            noAMOLED: !!theme.theme_color_map && !Object.values(theme.theme_color_map)[0][2]
        };
    } catch (error) {
        themeState = {
            isApplied: false,
            anError: true,
            reason: ThemeErrors.UNEXPECTED_ERROR,
            errorArgs: [error]
        };
    }
}

function getTheme(): string | null {
    // Check if Aliucord.json file exists in settings directory
    if (!AliuFS.exists(SETTINGS_DIRECTORY + "Aliucord.json")) {
        themeState = {
            isApplied: false,
            anError: false,
            reason: ThemeErrors.NO_SETTINGS,
        };
        return null;
    }

    // Read the settings file
    const content = AliuFS.readFile(SETTINGS_DIRECTORY + "Aliucord.json", "text");
    const json = JSON.parse(content as string);

    // Check if theme is enabled
    if (!json.theme) {
        themeState = {
            isApplied: false,
            anError: false,
            reason: ThemeErrors.THEME_UNSET
        };
        return null;
    }

    return json.theme;
}

function loadThemes(): boolean {
    // Check if themes directory exists
    if (!AliuFS.exists(THEME_DIRECTORY)) {
        themeState = {
            isApplied: false,
            anError: false,
            reason: ThemeErrors.NO_THEME_DIRECTORY
        };
        return false;
    }

    for (const file of AliuFS.readdir(THEME_DIRECTORY)) {
        // Check if file is a json file
        if (!file.name.endsWith(".json")) continue;

        // Read the file
        const content = AliuFS.readFile(THEME_DIRECTORY + file.name, "text");

        let json: Theme;
        try {
            json = JSON.parse(content as string);
        } catch (error) {
            excludedThemes.invalidThemes.push({
                name: file.name,
                reason: "File is not in a valid JSON format, please re-check."
            });

            continue;
        }

        // Check if file is a valid theme
        if (!json.name || (!json.theme_color_map && !json.colors && !json.colours)) {
            if (json["manifest"] && json["simple_colors"]) {
                excludedThemes.invalidThemes.push({
                    name: json["manifest"]?.["name"] ?? file.name,
                    reason: "Possibly a legacy theme. Please note that legacy themes are not supported in the new version."
                });
                continue;
            }

            excludedThemes.invalidThemes.push({
                name: file.name,
                reason: "Theme is not in a valid theme format; theme must have a name and at least has a 'theme_color_map' or 'colors' key."
            });
            continue;
        } else if (loadedThemes[json.name]) {
            excludedThemes.duplicatedThemes.push(json.name);
            continue;
        }

        // Add theme to loaded themes
        loadedThemes[json.name] = json;
    }

    return true;
}

function unfreezeThemeConstants() {
    Constants.UNSAFE_Colors && AliuHermes.unfreeze(Constants.UNSAFE_Colors);
}

// returns a 0xRRGGBBAA 32bit int
function normalizeColor(color: string): number {
    const processed = Number(window.ReactNative.processColor(color));
    return ((processed & 0x00ffffff) << 8 | processed >>> 24) >>> 0;
}

function overwriteColors(target, source) {
    if (!target || !source) return;

    // target is SemanticColorsByThemeTable
    if (Array.isArray(target)) {
        // Enmity compatibility for chat background
        source["BACKGROUND_PRIMARY"] && (source["CHAT_BACKGROUND"] ??= source["BACKGROUND_PRIMARY"]);

        for (const key in source) { // ex: "CHAT_BACKGROUND"
            if (!DiscordColorMap.SemanticColor[key]) continue; // skip if key doesn't exist in SemanticColor (ex: "BACKGROUND_PRIMARY"
            const index = Number(DiscordColorMap.SemanticColor[key]) >>> 0; // ex: 25

            for (let i = 0; i < source[key].length; i++) {
                const isNumeric = typeof target[i][index] === "number";
                target[i][index] = isNumeric ? normalizeColor(source[key][i]) : source[key][i];
            }
        }
        return;
    }

    // target is RawColor or UNSAFE_Colors
    for (const key in source) {
        if (typeof target[key] === "string") {
            target[key] = source[key];
        }
    }
}

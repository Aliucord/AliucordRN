import { Theme } from "./entities";

export enum ThemeErrors {
    HAS_THEME_NO_SETTINGS = "Themes exists but no settings",
    UNKNOWN_THEME = "Unkown theme applied, reverting to default",
    UNEXPECTED_ERROR = "Unexpected error",
    THEME_UNSET = "Theme is unset",
    NO_THEME_DIRECTORY = "Theme directory not found",
}

type ThemeConstants = {
    ThemeColorMap: Record<string, [string, string, string?]>;
    Colors: Record<string, string>;
    UNSAFE_Colors: Record<string, string>;
};

let Constants: ThemeConstants;

const { externalStorageDirectory } = window.nativeModuleProxy.AliucordNative;
const SETTINGS_DIRECTORY = externalStorageDirectory + "/AliucordRN/settings/";
const THEME_DIRECTORY = externalStorageDirectory + "/AliucordRN/themes/";

// These are handled after Aliucord loads
export let ThemeState: {
    currentTheme?: string;
    isApplied?: boolean;

    applyFailed?: boolean;
    reason?: ThemeErrors;
    errorArgs?: any[];
    shouldShowDialog?: boolean;

    invalidThemes?: string[];
    duplicatedThemes?: string[];
};

export const loadedThemes: Theme[] = [];

export function loadTheme(constants: ThemeConstants) {
    Constants = constants;
    unfreezeThemeConstants();
    handleThemeApply();
}

export function handleThemeApply() {
    try {
        const { ThemeColorMap, Colors, UNSAFE_Colors } = Constants;

        if (!loadThemes()) return;
        const themeName = getTheme();

        // File doesn't exist or theme isn't set
        if (!themeName) return;

        const theme = loadedThemes[themeName];
        if (!theme) {
            ThemeState = {
                currentTheme: themeName,
                applyFailed: true,
                reason: ThemeErrors.UNKNOWN_THEME,
                shouldShowDialog: true,
            };
            return;
        }

        overwriteColors(ThemeColorMap, theme.theme_color_map);
        overwriteColors(Colors, theme.colors ?? theme.colours);
        overwriteColors(UNSAFE_Colors, theme.unsafe_colors);

        ThemeState = {
            ...(ThemeState ?? {}),
            currentTheme: themeName,
            isApplied: true,
        };
    } catch (error) {
        ThemeState = {
            applyFailed: true,
            reason: ThemeErrors.UNEXPECTED_ERROR,
            errorArgs: [error],
            shouldShowDialog: true,
        };
    }
}

function getTheme(): string | undefined {
    // Check if Aliucord.json file exists in settings directory
    if (!AliuFS.exists(SETTINGS_DIRECTORY + "Aliucord.json")) {
        ThemeState = {
            applyFailed: true,
            reason: ThemeErrors.HAS_THEME_NO_SETTINGS,
        };
        return undefined;
    }

    // Read the settings file
    const content = AliuFS.readFile(SETTINGS_DIRECTORY + "Aliucord.json", "text");
    const json = JSON.parse(content as string);

    // Check if theme is enabled
    if (!json.theme) {
        ThemeState = {
            isApplied: false,
            reason: ThemeErrors.THEME_UNSET,
            shouldShowDialog: false,
        };
        return undefined;
    }

    return json.theme;
}

function loadThemes(): boolean {
    // Check if themes directory exists
    if (!AliuFS.exists(THEME_DIRECTORY)) {
        // applyFailed is set here because theme directory is *supposed* to always exist, however this won't bother the user
        ThemeState = {
            isApplied: false,
            applyFailed: true,
            reason: ThemeErrors.NO_THEME_DIRECTORY,
            shouldShowDialog: false,
        };
        return false;
    }

    for (const file of AliuFS.readdir(THEME_DIRECTORY)) {
        // Check if file is a json file
        if (!file.name.endsWith(".json")) continue;

        // Read the file
        const content = AliuFS.readFile(THEME_DIRECTORY + file.name, "text");
        const json = JSON.parse(content as string) as Theme;

        // Check if file is a valid theme
        if (!json.name || (!json.theme_color_map && !json.colors && !json.colours)) {
            ThemeState = {
                ...ThemeState,
                invalidThemes: [...(ThemeState?.invalidThemes ?? []), json.name],
            };
        } else if (loadedThemes[json.name] !== undefined) {
            ThemeState = {
                ...ThemeState,
                duplicatedThemes: [...(ThemeState?.duplicatedThemes ?? []), json.name],
            };
        }

        // Add theme to loaded themes
        loadedThemes[json.name] = json;
    }

    return true;
}

function unfreezeThemeConstants() {
    for (const key of ["ThemeColorMap", "Colors", "UNSAFE_Colors"]) {
        Constants[key] && AliuHermes.unfreeze(Constants[key]);
    }
}

function overwriteColors(target, source) {
    if (!target || !source) return;

    for (const key in source) {
        // Skip if property doesn't exist in target
        if (!target[key]) continue;

        // target is ThemeColorMap
        if (typeof target[key] === "object") {
            for (const i in source[key]) {
                target[key][i] = source[key][i];
            }

            // Enmity compatibility for chat background
            if (!source["CHAT_BACKGROUND"]) {
                target["CHAT_BACKGROUND"] = source["BACKGROUND_PRIMARY"];
            }
        }
        // target is Colors or UNSAFE_Colors
        else if (typeof target[key] === "string") {
            target[key] = source[key];
        }
    }
}

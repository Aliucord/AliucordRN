import type { EmitterSubscription, ImageSourcePropType, ImageStyle, TextStyle, ViewStyle } from "react-native";
import { overwriteThemeColors, themerInit } from "../themerInit";
import { Logger } from "../utils/Logger";

declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any; };

const logger = new Logger("Metro");

/**
 * Module filter options
 */
type FilterOptions = {
    exports?: boolean;
    default?: false;
} | {
    exports?: true;
    default?: true;
};

/**
 * Make the property non enumerable so it is not included in module search.
 */
function blacklist(id: number) {
    Object.defineProperty(modules, id, {
        value: modules[id],
        enumerable: false,
        configurable: true,
        writable: true
    });
}

let constantsModuleFound = false;
let colorsModuleFound = false;
let nullProxyFound = false;

for (const key in modules) {
    const id = Number(key);
    const module = modules[id];

    // React module
    if (module.isInitialized && ["createElement", "useState"].every(x => module.publicModule.exports?.[x])) {
        window.React = module.publicModule.exports;
        continue;
    }

    // React Native module
    if (module.isInitialized && ["View", "processColor"].every(x => module.publicModule.exports?.[x])) {
        window.ReactNative = module.publicModule.exports;
        continue;
    }

    // Blacklist the stupid proxy that returns null to everything
    if (!nullProxyFound && module.isInitialized && module.publicModule && module.publicModule.exports) {
        if (module.publicModule.exports["get defeated by your own weapon nerd"] === null) {
            blacklist(id);
            nullProxyFound = true;
            continue;
        }
    }

    // Theme colors are overwritten here
    if (!constantsModuleFound && module?.publicModule?.exports?.ThemeColorMap) {
        themerInit(module.publicModule.exports);

        constantsModuleFound = true;
        continue;
    }

    if (!colorsModuleFound && module?.publicModule?.exports?.SemanticColorsByThemeTable) {
        overwriteThemeColors(module.publicModule.exports);

        colorsModuleFound = true;
        continue;
    }

    if (module.factory) {
        const strings = AliuHermes.findStrings(module.factory);

        // Blacklist momentjs locale modules which change the language as a side effect
        if (strings.length === 8 && strings[6] === "moment") {
            blacklist(id);
            continue;
        }
    }
}

if (!nullProxyFound) {
    console.warn("Null proxy not found, expect problems");
}

if (!constantsModuleFound || !colorsModuleFound) {
    console.warn("Discord modules needed for theming wasn't found, expect weird behaviours.");
}

/**
 * Find a Discord Module
 * @param filter Module filter
 * @param options Options.
 * @returns Module if found, else null
 */
export function getModule(filter: (module: any) => boolean, options?: FilterOptions) {
    const { exports = true, default: defaultExport = true } = options ?? {};

    for (const key in modules) {
        const id = Number(key);

        let mod;
        try {
            mod = __r(id);
        } catch {
            // Some modules throw error, ignore
        }
        if (!mod) continue;

        try {
            if (filter(mod)) {
                const module = modules[id].publicModule;
                return exports ? module.exports : module;
            }

            if (mod.default && filter(mod.default)) {
                const module = modules[id].publicModule;
                return defaultExport ? module.exports.default :
                    exports ? module.exports : module;
            }
        } catch (e: any) {
            (logger ?? console).error("Error during getModule", e?.stack ?? e);
        }
    }

    return null;
}

type PropIntellisense<P extends string> = Record<P, any> & Record<PropertyKey, any>;

/**
 * Find a module by props
 * @param props One or more props
 */
export function getByProps<T extends string>(...props: T[]): PropIntellisense<T>;
export function getByProps<T extends string>(...options: [...props: T[], options: FilterOptions]): PropIntellisense<T>;
export function getByProps<T extends string>(...options: [...props: T[], defaultExport: boolean]): PropIntellisense<T>;
export function getByProps(...props: any[]) {
    if (!props.length) return null;

    const options = typeof props[props.length - 1] === "object" ? props.pop() : {};
    const filter = (module: any) => {
        for (let i = 0, len = props.length; i < len; i++)
            if (module[props[i]] === undefined) return false;
        return true;
    };

    return getModule(filter, typeof options === "boolean" ? { default: options } : options);
}

/**
 * Find a module by its displayName property. Usually useful for finding React Components
 * @returns Module if found, else null
 */
export function getByDisplayName(displayName: string, options?: FilterOptions) {
    return getModule(m => m.displayName === displayName, options);
}

/**
 * Find a module by its default.name property. Usually useful for finding React Components
 * @returns Module if found, else null
 */
export function getByName(defaultName: string, options?: FilterOptions) {
    return getModule(m => m?.default?.name === defaultName, options);
}

/**
 * Find a Store by its name. 
 * @returns Module if found, else null
 */
export function getByStoreName(storeName: string, options?: FilterOptions) {
    return getModule(m => m.getName?.() === storeName, options);
}

/**
 * Get a module by its numeric id. Unless you know what you're doing, you
 * should not use this.
 */
export const getById = __r;

/**
 * Same as getModule, but retrieves all matches instead of the first
 * @returns Array of modules
 */
export function getAll(filter: (module: any) => boolean, options?: FilterOptions): any[] {
    const { exports = true, default: defaultExport = true } = options ?? {};

    const ret = [] as any[];
    for (const key in modules) {
        const id = Number(key);

        let mod;
        try {
            mod = __r(id);
        } catch {
            // Some modules throw error, ignore
        }

        if (!mod) continue;

        try {
            if (filter(mod)) {
                const module = modules[Number(id)].publicModule;
                ret.push(exports ? module.exports : module);
            }

            if (mod.default && filter(mod.default)) {
                const module = modules[Number(id)].publicModule;
                return defaultExport ? module.exports.default :
                    exports ? module.exports : module;
            }
        } catch (e: any) {
            (logger ?? console).error("Error during getModule", e?.stack ?? e);
        }
    }

    return ret;
}

/**
 * Same as getByProps, but retrieves all matches instead of the first
 * @returns Array of modules
 */
export function getAllByProps<T extends string>(...props: T[]): PropIntellisense<T>[];
export function getAllByProps<T extends string>(...options: [...props: T[], options: FilterOptions]): PropIntellisense<T>[];
export function getAllByProps<T extends string>(...options: [...props: T[], defaultExport: boolean]): PropIntellisense<T>[];
export function getAllByProps(...props: any[]) {
    if (!props.length) return [];

    const options = typeof props[props.length - 1] === "object" ? props.pop() : {};
    const filter = (module: any) => {
        for (let i = 0, len = props.length; i < len; i++)
            if (module[props[i]] === undefined) return false;
        return true;
    };

    return getAll(filter, typeof options === "boolean" ? { default: options } : options);
}

/**
 * Find all modules with properties containing the specified keyword 
 * @param keyword They keyword
 * @param skipConstants Whether constants (names that are FULL_CAPS) should be skipped. Defaults to true
 * @returns Array of names that match. You can then access moduleSearchResults.SomeName to view the
 *          corresponding module 
 */
export function searchByKeyword(keyword: string, skipConstants = true) {
    keyword = keyword.toLowerCase();
    const matches = [] as string[];
    window.moduleSearchResults = {};

    function check(obj: any) {
        if (!obj) return;
        for (const name of Object.getOwnPropertyNames(obj)) {
            if (name.toLowerCase().includes(keyword) && (!skipConstants || name.toUpperCase() !== name)) {
                matches.push(name);
                window.moduleSearchResults[name] = obj;
            }
        }
    }

    for (const id in modules) {
        try {
            __r(Number(id));
            const mod = modules[id]?.publicModule;
            if (mod) {
                check(mod);
                check(mod.exports);
                check(mod.exports?.default);
            }
        } catch {
            //
        }
    }

    return matches;
}

export const UserStore = getByStoreName("UserStore");
export const GuildStore = getByStoreName("GuildStore");
export const ThemeStore = getByStoreName("ThemeStore");
export const ChannelStore = getByStoreName("ChannelStore");
export const MessageStore = getByStoreName("MessageStore");
export const GuildMemberStore = getByStoreName("GuildMemberStore");
export const SelectedChannelStore = getByStoreName("SelectedChannelStore");
export const UnsyncedUserSettingsStore = getByStoreName("UnsyncedUserSettingsStore");
export const SearchStore = getByProps("useDiscoveryState", "useQueryState");

export const ModalActions = getByProps("closeModal");
export const MessageActions = getByProps("sendMessage", "receiveMessage");
export const FluxDispatcher = getByProps("subscribe", "isDispatching");
export const FetchUserActions = getByProps("getUser", "fetchProfile");
export const ContextMenuActions = getByProps("openContextMenu");
export const SnowflakeUtils = getByProps("fromTimestamp", "extractTimestamp");
export const Locale = getByProps("Messages");
export const AMOLEDThemeManager = getByProps("setAMOLEDThemeEnabled");
export const Users = getByProps("getCurrentUser");
export const Profiles = getByProps("showUserProfile");

export const Clipboard = getByProps("getString", "setString", "hasString") as {
    getString(): Promise<string>,
    setString(str: string): Promise<void>,
    hasString(): Promise<boolean>,
    getImage(): Promise<string>,
    addListener(callback: () => void): EmitterSubscription,
    removeAllListeners(): void;
};

export enum AMOLEDThemeState {
    HIDDEN,
    OFF,
    ON
}

export const setAMOLEDThemeEnabledBypass = (state) => {
    FluxDispatcher.dispatch({
        type: "UNSYNCED_USER_SETTINGS_UPDATE",
        settings: { useAMOLEDTheme: state ? AMOLEDThemeState.ON : AMOLEDThemeState.OFF }
    });
};

export const Dialog = getByProps("show", "openLazy", "confirm", "close") as {
    show(options: {
        title?: string,
        body?: string,
        confirmText?: string,
        cancelText?: string,
        confirmColor?: string,
        isDismissable?: boolean,
        onConfirm?: () => any,
        onCancel?: () => any,
        [k: PropertyKey]: any;
    }),
    close(),
    [k: PropertyKey]: any;
};

export const Toasts = getModule(m => (
    m.open !== undefined && m.close !== undefined && !m.openLazy && !m.startDrag && !m.init && !m.openReplay && !m.openChannelCallPopout
)) as {
    open(options: {
        content?: string,
        source?: ImageSourcePropType,
        [k: PropertyKey]: any;
    }),
    close(),
    [k: PropertyKey]: any;
};

export const React = window.React as typeof import("react");
export const ReactNative = window.ReactNative as typeof import("react-native");

export const RestAPI = getByProps("getAPIBaseURL", "get");
export const Flux = getByProps("connectStores");
export const Constants = getByProps("Fonts") as import("./constants").default;
export const URLOpener = getByProps("openURL", "handleSupportedURL");
export const Forms = getByProps("FormSection");
export const Scenes = getByName("getScreens", { default: false });
export const ThemeManager = getByProps("updateTheme", "overrideTheme");
export const SemVer = getByProps("SemVer");

export const Navigation = getByProps("pushLazy");
export const NavigationStack = getByProps("createStackNavigator");
export const NavigationNative = getByProps("NavigationContainer");
export const DiscordNavigator = getByName("Navigator", { default: false });

// Abandon all hope, ye who enter here
type Style = ViewStyle & ImageStyle & TextStyle;
type Styles = Partial<{ [key in keyof Style]: readonly [Style[key], Style[key]] | Style[key] }>;
type FlattenValue<T> = { [key in keyof T]: T[key] extends ReadonlyArray<infer E> ? E : T[key] };

export const Styles = getByProps("createThemedStyleSheet") as {
    ThemeColorMap: Record<string, [string, string]>;
    createThemedStyleSheet: <T extends { [key: string]: Styles; }>(styles: T)
        => { [key in keyof T]: FlattenValue<T[key]>; };
    getThemedStylesheet: <T extends { [key: string]: Styles; }>(styles: T)
        => Record<"mergedDarkStyles" | "mergedLightStyles", { [key in keyof T]: FlattenValue<T[key]>; }>;
};

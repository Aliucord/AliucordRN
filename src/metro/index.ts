import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
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

// If you are curious why this exists, run
// __r(994) and enjoy your Hindi timestamps
function isModuleBlacklisted(id: number) {
    if (id === 54 || id >= 966 && id <= 994) return true;
    return false;
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

        if (isModuleBlacklisted(id)) continue;


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
        } catch (e) {
            logger.error("Error during getModule", e);
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

        if (isModuleBlacklisted(id)) continue;

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
        } catch (e) {
            logger.error("Error during getAll", e);
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

type KeywordOptions = {
    caseSensitive?: boolean;
    returnModules?: boolean;
    skipConstants?: true;
    onlyConstants?: false;
} | {
    caseSensitive?: boolean;
    returnModules?: boolean;
    skipConstants?: false;
    onlyConstants?: boolean;
};

/**
 * Find all modules with properties containing the specified keyword 
 * @param {string | string[]} keyword They keyword
 * @param {KeywordOptions | boolean} options An object of options to modify the search return and parsing. Can also be a boolean, that being the same as {@link KeywordOptions.skipConstants} (skip names that are FULL_CAPS). Defaults to true.
 * @returns Array of names (or modules if the returnModules option is true) that match the keyword or keywords.
 */
export function searchByKeyword(keyword: string | string[], _options: KeywordOptions | boolean = true) {
    const options = typeof _options === 'boolean' ? { skipConstants: _options } as KeywordOptions : _options;

    if (!options.onlyConstants && options.skipConstants === undefined) {
        options.skipConstants = true;
    }

    // Don't mutate keyword directly because otherwise TS complains about it possibly being a string.
    let keywords = Array.isArray(keyword) ? keyword : [keyword];

    if (!options.caseSensitive) {
        keywords = keywords.map(k => k.toLowerCase());
    }

    const matches: (string | any)[] = [];
    function check(obj: any) {
        if (!obj) return;
        outer: for (const name of Object.getOwnPropertyNames(obj)) {
            if (options.caseSensitive) {
                for (let i = 0; i < keywords.length; i++) {
                    if (!~name.indexOf(keywords[i]))
                        continue outer;
                }
            } else {
                for (let i = 0; i < keywords.length; i++) {
                    if (!~name.toLowerCase().indexOf(keywords[i]))
                        continue outer;
                }
            }

            if (
                options.skipConstants && name === name.toUpperCase() ||
                options.onlyConstants && name !== name.toUpperCase()
            ) {
                continue;
            }

            matches.push(options.returnModules ? obj : name);
        }
    }

    for (const id in modules) if (!isModuleBlacklisted(Number(id))) {
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
export const ChannelStore = getByStoreName("ChannelStore");
export const MessageStore = getByStoreName("MessageStore");
export const GuildMemberStore = getByStoreName("GuildMemberStore");
export const SelectedChannelStore = getByStoreName("SelectedChannelStore");

export const ModalActions = getByProps("closeModal");
export const MessageActions = getByProps("sendMessage", "receiveMessage");
export const FluxDispatcher = getByProps("dirtyDispatch");
export const FetchUserActions = getByProps("fetchProfile");
export const ContextMenuActions = getByProps("openContextMenu");

export const Clipboard = getByProps("getString", "setString") as {
    getString(): Promise<string>,
    setString(str: string): Promise<void>;
};

export const RestAPI = getByProps("getAPIBaseURL", "get");
export const i18n = getByProps("Messages");
export const Flux = getByProps("connectStores");
export const React = getByProps("createElement") as typeof import("react");
export const ReactNative = getByProps("Text", "Image") as typeof import("react-native");
export const Constants = getByProps("ActionTypes") as import("./constants").default;
export const URLOpener = getByProps("openURL", "handleSupportedURL");
export const Forms = getByProps("FormSection");

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

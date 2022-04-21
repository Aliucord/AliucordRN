import { Logger } from "../utils/Logger";
import type Constants from "./constants";

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
        } catch (err) {
            console.error(err);
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

/**
 * Find all modules with properties containing the specified keyword 
 * @param keyword They keyword
 * @param skipConstants Whether constants (names that are FULL_CAPS) should be skipped. Defaults to true
 * @returns Array of names that match. You can then access moduleSearchResults.SomeName to view the
 *          corresponding module 
 */
export function searchByKeyword(keyword: string, skipConstants = true) {
    keyword = keyword.toLowerCase();
    const matches = [];
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

    for (const id in modules) if (!isModuleBlacklisted(Number(id))) {
        try {
            __r(Number(id));
            const mod = modules[id]?.publicModule;
            if (mod) {
                check(mod);
                check(mod.exports);
                check(mod.exports?.default);
            }
        } catch (err) {
            //
        }
    }

    return matches;
}

// Common modules
export let Clipboard: {
    getString(): Promise<string>;
    setString(text: string): Promise<string>;
};
export let UserStore: any;
export let GuildStore: any;
export let ChannelStore: any;
export let MessageStore: any;
export let GuildMemberStore: any;
export let SelectedChannelStore: any;

export let ModalActions: any;
export let MessageActions: any;
export let FluxDispatcher: any;
export let FetchUserActions: any;
export let ContextMenuActions: any;

export let RestAPI: any;
export let i18n: any;
export let Flux: any;
export let React: typeof import("react");
export let ReactNative: typeof import("react-native");
export let constants: Constants;
export let URLOpener: any;

export function _initMetro() {
    UserStore = getByStoreName("UserStore");
    GuildStore = getByStoreName("GuildStore");
    ChannelStore = getByStoreName("ChannelStore");
    MessageStore = getByStoreName("MessageStore");
    GuildMemberStore = getByStoreName("GuildMemberStore");
    SelectedChannelStore = getByStoreName("SelectedChannelStore");

    ModalActions = getByProps("closeModal");
    MessageActions = getByProps("sendMessage", "receiveMessage");
    FluxDispatcher = getByProps("dirtyDispatch");
    FetchUserActions = getByProps("fetchProfile");
    ContextMenuActions = getByProps("openContextMenu");

    Clipboard = getByProps("getString", "setString");
    RestAPI = getByProps("getAPIBaseURL", "get");
    i18n = getByProps("Messages");
    Flux = getByProps("connectStores");
    React = getByProps("createElement") as any;
    ReactNative = getByProps("Text", "Image") as any;
    constants = getByProps("ActionTypes") as any;
    URLOpener = getByProps("openURL", "handleSupportedURL");
}

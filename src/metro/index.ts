import { Logger } from "../utils/Logger";

declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any; };

const logger = new Logger("Metro");

/**
 * This code may be a bit hard to follow but all it's doing is disallowing:
 * 
 * { default: true, exports: false }
 * 
 * because it's not possible to return *outside* 'exports' AND return *inside* 'default'
 */
type FilterOptions = {
    exports?: boolean;
    default?: false;
} | {
    exports?: true;
    default?: true;
};

function isModuleBlacklisted(id: number) {
    if (id === 54 || id >= 966 && id <= 994) return true;
    return false;
}

export function getModule(filter: (module: any) => boolean, options?: FilterOptions) {
    const { exports = true, default: defaultExport = true } = options ?? {};

    for (const key in modules) {
        const id = Number(key);
        
        23
        32
        32
        32
        32
        

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
                return exports ? module.exports : module;
            }

            if (mod.default && filter(mod.default)) {
                const module = modules[Number(id)].publicModule;
                return defaultExport ? module.exports.default :
                    exports ? module.exports : module;
            }
        } catch (e) {
            logger.error("Error during getModule", e);
        }
    }

    return null;
}

type PropIntellisense<T extends string> = { [P in T]: any; } & Record<any, any>;

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

export function getByDisplayName(displayName: string, options?: FilterOptions) {
    return getModule(m => m.displayName === displayName, options);
}

export function getByStoreName(storeName: string, options?: FilterOptions) {
    return getModule(m => m.getName?.() === storeName, options);
}

export const getById = __r;

export function getAll(filter: (module: any) => boolean, options?: FilterOptions): any[] {
    const { exports = true, default: defaultExport = true } = options ?? {};

    const ret = [];
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

// Common modules
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

export let i18n: any;
export let Flux: any;
export let React: typeof import("react");
export let constants: import('./constants').default;

export function _initMetro() {
    UserStore = getByStoreName("UserStore");
    GuildStore = getByStoreName("GuildStore");
    ChannelStore = getByStoreName("ChannelStore");
    MessageStore = getByStoreName("MessageStore");
    GuildMemberStore = getByStoreName("GuildMemberStore");
    SelectedChannelStore = getByStoreName("SelectedChannelStore");

    ModalActions = getByProps("closeModal");
    MessageActions = getByProps("sendMessage");
    FluxDispatcher = getByProps("dirtyDispatch");
    FetchUserActions = getByProps("fetchProfile");
    ContextMenuActions = getByProps("openContextMenu");

    i18n = getByProps("Messages");
    Flux = getByProps("connectStores");
    React = getByProps("createElement") as any;
    constants = getByProps("ActionTypes") as any;
}

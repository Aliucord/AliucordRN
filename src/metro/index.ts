import { Logger } from "../utils/Logger";

declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any; };

const logger = new Logger("Metro");

export interface FilterOptions {
    exports?: boolean;
    default?: boolean;
}

function isModuleBlacklisted(id: number) {
    if (id === 54 || id >= 966 && id <= 994) return true;
    return false;
}

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


export function getByProps(...props: string[]): any;
export function getByProps(...options: [...props: string[], options: FilterOptions]): any;
export function getByProps(...options: [...props: string[], defaultExport: boolean]): any;
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

export function getAllByProps(...props: string[]): any[];
export function getAllByProps(...options: [...props: string[], options: FilterOptions]): any[];
export function getAllByProps(...options: [...props: string[], defaultExport: boolean]): any[];
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

export let React: typeof import("react");
export let i18n: any;

export function _initMetro() {
    React = getByProps("createElement");
    i18n = getModule(m => m.default?.Messages).default;
}

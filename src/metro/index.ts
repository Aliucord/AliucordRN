import { Logger } from "../utils/Logger";

declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any };

const logger = new Logger("Metro");

function isModuleBlacklisted(id: number) {
    if (id === 54 || id >= 966 && id <= 994) return true;
    return false;
}

export function getModule(filter: (module: any) => boolean, exports = true): any {
    for (const key in modules) {
        const id = Number(key);
        if (isModuleBlacklisted(id)) continue;
        let mod;
        try {
            mod = __r(id);
        } catch {
            // Some modules throw error, ignore
        }
        try {
            if (mod != null && filter(mod)) {
                const module = modules[Number(id)].publicModule;
                return exports ? module.exports : module;
            }
        } catch (e) {
            logger.error("Error during getModule", e);
        }
    }

    return null;
}


export function getByProps(...props: string[]): any;
export function getByProps(exports: boolean, ...props: string[]): any;
export function getByProps(exports: boolean | string, ...props: string[]): any {
    if (typeof exports !== "boolean") {
        props.unshift(exports);
        exports = true;
    }
    const filter = (module: any) => {
        for (let i = 0, len = props.length; i < len; i++)
            if (module[props[i]] === undefined) return false;
        return true;
    };
    return getModule(filter, exports);
}


export const getModuleById = __r;

export function getAll(filter: (module: any) => boolean, exports = true) {
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
        try {
            if (mod != null && filter(mod)) {
                const module = modules[Number(id)].publicModule;
                ret.push(exports ? module.exports : module);
            }
        } catch (e) {
            logger.error("Error during getModule", e);
        }
    }

    return ret;
}

export function getAllByProps(...props: string[]): any;
export function getAllByProps(exports: boolean, ...props: string[]): any;
export function getAllByProps(exports: boolean | string, ...props: string[]): any {
    if (typeof exports !== "boolean") {
        props.unshift(exports);
        exports = true;
    }
    const filter = (module: any) => {
        for (let i = 0, len = props.length; i < len; i++)
            if (module[props[i]] === undefined) return false;
        return true;
    };
    return getAll(filter, exports);
}

// Common modules

export let React: typeof import("react");
export let i18n: any;

export function _initMetro() {
    React = getByProps("createElement");
    i18n = getModule(m => m.default?.Messages).default;
}

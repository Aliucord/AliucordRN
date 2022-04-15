declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any };

export function getModule(filter: (module: any) => boolean, exports = true): any {
    const id = Object.keys(modules).find((str) => {
        const i = Number(str);
        if (i >= 966 && i <= 994) return false;
        try {
            const module = __r(i);
            return module !== undefined && filter(module);
        } catch (e) {
            return false;
        }
    });
    if (id === undefined) return null;

    const module = modules[Number(id)].publicModule;
    return exports ? module.exports : module;
}

export const getModuleById = __r;

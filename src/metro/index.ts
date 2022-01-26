declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any };

export function getModule(filter: (module: any) => boolean, exports = true): any {
    const id = Object.keys(modules).map(i => Number(i)).find(i => {
        let module: any;
        try {
            module = __r(i);
        } catch (e) {
            return false;
        }
        return module !== undefined && filter(module);
    });
    if (id === undefined) return null;

    const module = modules[id].publicModule;
    return exports ? module.exports : module;
}

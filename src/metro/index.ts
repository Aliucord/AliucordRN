declare const __r: (moduleId: number) => any;
declare const modules: { [id: number]: any };

export function getModule(filter: (module: any) => boolean, exports = true): any {
    const id = Object.keys(modules).map(i => Number(i)).find(i => i === 134 || i === 338 || i === 339 ? false : filter(__r(i)));
    if (id === undefined) return null;

    const module = modules[id].publicModule;
    return exports ? module.exports : module;
}
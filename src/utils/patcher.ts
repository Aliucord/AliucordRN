import { Logger } from "./Logger";

const logger = new Logger("Patcher");
// TODO: Should this be a symbol? String is probably better so you can access
// it during debugging
const patchInfoSym = "__ALIUCORD_PATCH_INFO__";

export type BeforePatchFn<T, R, A extends any[]> = (
    ctx: PatchContext<T, R, A>,
    ...args: A
) => R | void;

export type AfterPatchFn<T, R, A extends any[]> = (
    ctx: AfterPatchContext<T, R, A>,
    result: R,
    ...args: A
) => R | void;

export type InsteadFn<T, R, A extends any[]> = (
    ctx: PatchContext<T, R, A>,
    ...args: A
) => R;

export type Unpatch = () => void;

export enum PatchPriority {
    MIN = 0,
    DEFAULT = 15,
    MAX = 30
}

type PatchFns<T, R, A extends any[]> = {
    before?: BeforePatchFn<T, R, A>,
    instead?: InsteadFn<T, R, A>,
    after?: AfterPatchFn<T, R, A>;
};

export class Patch<T, R, A extends any[]> {
    public before: BeforePatchFn<T, R, A>;
    public after: AfterPatchFn<T, R, A>;

    public constructor(
        data: PatchFns<T, R, A>,
        public readonly priority: number = PatchPriority.DEFAULT,
        public readonly plugin?: string
    ) {
        if (this.priority < PatchPriority.MIN || this.priority > PatchPriority.MAX) {
            throw new Error("Priority must be between PatchPriority.MIN and PatchPriority.MAX");
        }

        const defaultFn = () => void 0;

        if (data.instead) {
            if (data.after || data.before) {
                throw new Error("Instead patches cannot specify before or after patches.");
            }

            const { instead } = data;
            this.before = (ctx: PatchContext<T, R, A>, ...args: A) => {
                ctx.result = instead(ctx, ...args);
            };
            this.after = defaultFn;
        } else {
            this.before = data.before ?? defaultFn;
            this.after = data.after ?? defaultFn;
        }
    }
}

class PatchInfo<T, R, A extends any[]> {
    public constructor(public readonly backup: (...args: A) => R, public readonly methodName: string) { }

    private readonly _patches = [] as Patch<T, R, A>[];

    private error(patch: Patch<T, R, A>, type: "PrePatch" | "PostPatch", error: any) {
        const message =
            (patch.plugin ? `[${patch.plugin}] ` : "") +
            (`Error during ${this.methodName} ${type}\n`);
        logger.error(message, error);
    }

    public get patchCount() {
        return this._patches.length;
    }

    public addPatch(patch: Patch<T, R, A>) {
        if (this._patches.includes(patch)) return false;
        this._patches.push(patch);
        this._patches.sort((a, b) => b.priority - a.priority);
        return true;
    }

    public removePatch(patch: Patch<T, R, A>) {
        const idx = this._patches.indexOf(patch);
        if (idx === -1) return false;
        this._patches.splice(idx, 1);
        return true;
    }

    public makeReplacementFunc() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this;
        return function AliucordPatchFn(this: T, ...args: A) {
            return _this._callback(this, ...args);
        };
    }

    private _callback(thisObject: T, ...args: A) {
        const patches = this._patches;
        if (!patches.length) return this.backup.call(thisObject, ...args);

        const ctx = new PatchContext(thisObject, args, this.backup);

        let idx = 0;
        do {
            try {
                const result = patches[idx].before(ctx, ...ctx.args);
                if (result !== undefined) ctx.result = result;
            } catch (err: any) {
                this.error(patches[idx], "PrePatch", err);

                ctx.result = undefined;
                ctx._returnEarly = false;
                continue;
            }

            if (ctx._returnEarly) {
                idx++;
                break;
            }
        } while (++idx < patches.length);

        if (!ctx._returnEarly) {
            try {
                ctx.result = this.backup.call(ctx.thisObject, ...ctx.args);
            } catch (err: any) {
                ctx.error = err;
            }
        }

        idx--;
        do {
            const lastRes = ctx.result;
            const lastError = ctx.error;

            try {
                const result = patches[idx].after(ctx as AfterPatchContext<T, R, A>, ctx.result!, ...ctx.args);
                if (result !== undefined) ctx.result = result;
            } catch (err: any) {
                this.error(patches[idx], "PostPatch", err);

                if (lastError !== null) {
                    ctx.error = lastError;
                } else {
                    ctx.result = lastRes;
                }
            }
        } while (--idx >= 0);

        return ctx.getResultOrThrowError();
    }
}

class PatchContext<T, R, A extends any[]> {
    public constructor(
        public readonly thisObject: T,
        public readonly args: A,
        private readonly backup: (...args: A) => R
    ) { }

    private _result: R | undefined;
    private _error: Error | undefined;
    /** Do not use */
    _returnEarly = false;

    set result(value: R | undefined) {
        this._result = value;
        this._error = undefined;
        this._returnEarly = true;
    }

    get result(): R | undefined {
        return this._result;
    }

    get error(): Error | undefined {
        return this._error;
    }

    set error(error: Error | undefined) {
        this._returnEarly = error !== undefined;
        this._error = error;
    }

    getResultOrThrowError() {
        if (this._error !== undefined) throw this._error;
        return this._result;
    }

    callOriginal(): R {
        return callOriginal(this.backup, this.thisObject, this.args);
    }
}

type AfterPatchContext<T, R, A extends any[]> = PatchContext<T, R, A> & { result: R; };

function resolveMethod(obj: any, methodName: string) {
    if (obj == null) throw new Error("obj may not be null or undefined");
    if (typeof methodName !== "string" || !methodName) throw new Error("methodName must be a non empty string");

    const method = obj[methodName as any];
    if (method == null) throw new Error("No such method: " + methodName);
    if (typeof method !== "function") throw new Error(methodName + " is not a function");
    return method;
}

export function unpatch<T>(obj: T | any, methodName: string, patch: Patch<T, any, any>) {
    const func = resolveMethod(obj, methodName);
    const patchInfo = func[patchInfoSym] as PatchInfo<T, any, any>;
    if (patchInfo) {
        patchInfo.removePatch(patch);
        if (patchInfo.patchCount === 0) {
            obj[methodName] = patchInfo.backup;
        }
    }
}

export function callOriginal(func: (...args: any[]) => any, thisObj: any, ...args: any[]) {
    if (func == null || typeof func !== "function") throw new Error("Not a function: " + func);
    const patchInfo = func[patchInfoSym as keyof typeof func] as PatchInfo<any, any, any>;
    const original = patchInfo?.backup ?? func;
    return original.call(thisObj, ...args);
}

export function patch<T = any, R = any, A extends any[] = any[]>(
    object: T | any,
    name: string,
    patch: Patch<T, R, A>
): Unpatch {
    const original = resolveMethod(object, name);

    let patchInfo = original[patchInfoSym] as PatchInfo<T, R, A>;
    if (!patchInfo) {
        patchInfo = new PatchInfo(original, name);

        const replacement = patchInfo.makeReplacementFunc();
        Object.defineProperty(replacement, patchInfoSym, {
            value: patchInfo,
            enumerable: false,
            writable: true,
            configurable: true
        });
        Object.defineProperties(replacement, Object.getOwnPropertyDescriptors(original));

        object[name] = replacement;
    }

    patchInfo.addPatch(patch);

    return () => unpatch(object, name, patch);
}

export function before<T = any, R = any, A extends any[] = any[]>(
    object: any,
    name: string,
    before: BeforePatchFn<T, R, A>,
    priority = PatchPriority.DEFAULT,
    plugin?: string
): Unpatch {
    return patch(object, name, new Patch({ before }, priority, plugin));
}

export function instead<T = any, R = any, A extends any[] = any[]>(
    object: any,
    name: string,
    instead: InsteadFn<T, R, A>,
    priority = PatchPriority.DEFAULT,
    plugin?: string
): Unpatch {
    return patch(object, name, new Patch({ instead }, priority, plugin));
}

export function insteadDoNothing(object: any, name: string) {
    return instead(object, name, () => void 0);
}

export function after<T = any, R = any, A extends any[] = any[]>(
    object: any,
    name: string,
    after: AfterPatchFn<T, R, A>,
    priority = PatchPriority.DEFAULT,
    plugin?: string
): Unpatch {
    return patch(object, name, new Patch({ after }, priority, plugin));
}

import { Logger } from "./Logger";

const logger = new Logger("Patcher");
const patchInfoSym = Symbol("PatchInfo");

export type BeforePatchFn<TThis, TResult, TArgs extends any[]> = (
    ctx: PatchContext<TThis, TResult, TArgs>,
    ...args: TArgs
) => TResult | void;

export type AfterPatchFn<TThis, TResult, TArgs extends any[]> = (
    ctx: AfterPatchContext<TThis, TResult, TArgs>,
    ...args: TArgs
) => TResult | void;

export type InsteadFn<TThis, TResult, TArgs extends any[]> = (
    ctx: PatchContext<TThis, TResult, TArgs>,
    ...args: TArgs
) => TResult;

type Unpatch = () => void;

export enum PatchPriority {
    MIN = 0,
    DEFAULT = 15,
    MAX = 30
}

export class Patch<TThis, TResult, TArgs extends any[]> {
    public before: BeforePatchFn<TThis, TResult, TArgs>;
    public after: AfterPatchFn<TThis, TResult, TArgs>;
    public priority: number;

    public constructor(data: Partial<Patch<TThis, TResult, TArgs>> & { instead?: InsteadFn<TThis, TResult, TArgs> }) {
        this.priority = data.priority ?? PatchPriority.DEFAULT;
        if (this.priority < PatchPriority.MIN || this.priority > PatchPriority.MAX) {
            throw new Error("Priority must be between PatchPriority.MIN and PatchPriority.MAX");
        }

        const defaultFn = () => void 0;

        if (data.instead) {
            if (data.after || data.before) {
                throw new Error("Instead patches cannot specify before or after patches.");
            }

            const { instead } = data;
            this.before = (ctx: PatchContext<TThis, TResult, TArgs>, ...args: TArgs) => {
                ctx.result = instead(ctx, ...args);
            };
            this.after = defaultFn;
        } else {
            this.before = data.before ?? defaultFn;
            this.after = data.after ?? defaultFn;
        }
    }
}

class PatchInfo<TThis, TResult, TArgs extends any[]> {
    public constructor(public readonly backup: (...args: TArgs) => TResult) {}

    private readonly _patches = [] as Patch<TThis, TResult, TArgs>[];

    public get patchCount() {
        return this._patches.length;
    }

    public addPatch(patch: Patch<TThis, TResult, TArgs>) {
        if (this._patches.includes(patch)) return false;
        this._patches.push(patch);
        this._patches.sort((a, b) => b.priority - a.priority);
        return true;
    }

    public removePatch(patch: Patch<TThis, TResult, TArgs>) {
        const idx = this._patches.indexOf(patch);
        if (idx === -1) return false;
        this._patches.splice(idx, 1);
        return true;
    }

    public makeReplacementFunc() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _this = this;
        return function (this: TThis, ...args: TArgs) {
            return _this._callback(this, ...args);
        };
    }

    private _callback(thisObject: TThis, ...args: TArgs) {
        const patches = this._patches;
        if (!patches.length) return this.backup.call(thisObject, ...args);

        const ctx = new PatchContext(thisObject, args, this.backup);

        let idx = 0;
        do {
            try {
                const result = patches[idx].before(ctx, ...ctx.args);
                if (result !== undefined) ctx.result = result;
            } catch (err: any) {
                logger.error("Error while running PrePatch", err);

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
            const lastResult = ctx.result;
            const lastError = ctx.error;

            try {
                const result = patches[idx].after(ctx as AfterPatchContext<TThis, TResult, TArgs>, ...ctx.args);
                if (result !== undefined) ctx.result = result;
            } catch (err: any) {
                logger.error("Error while running PostPatch", err);

                if (lastError !== null) {
                    ctx.error = lastError;
                } else {
                    ctx.result = lastResult;
                }
            }
        } while (--idx >= 0);

        return ctx.getResultOrThrowError();
    }
}

class PatchContext<TThis, TResult, TArgs extends any[]> {
    public constructor(
        public readonly thisObject: TThis,
        public readonly args: TArgs,
        private readonly backup: (...args: TArgs) => TResult
    ) {}

    private _result: TResult | undefined;
    private _error: Error | undefined;
    /** Do not use */
    _returnEarly = false;

    set result(value: TResult | undefined) {
        this._result = value;
        this._error = undefined;
        this._returnEarly = true;
    }

    get result(): TResult | undefined {
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

    callOriginal(): TResult {
        return callOriginal(this.backup, this.thisObject, this.args);
    }
}

type AfterPatchContext<TThis, TResult, TArgs extends any[]> = PatchContext<TThis, TResult, TArgs> & { result: TResult };

function resolveMethod(obj: any, methodName: string) {
    if (obj == null) throw new Error("obj may not be null or undefined");
    if (typeof methodName !== "string" || !methodName) throw new Error("methodName must be a non empty string");

    const method = obj[methodName as any];
    if (method == null) throw new Error("No such method: " + methodName);
    if (typeof method !== "function") throw new Error(methodName + " is not a function");
    return method;
}

export function unpatch<TThis>(obj: TThis | any, methodName: string, patch: Patch<TThis, any, any>) {
    const func = resolveMethod(obj, methodName);
    const patchInfo = func[patchInfoSym] as PatchInfo<TThis, any, any>;
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

export function patch<TThis, TResult, TArgs extends any[] = any[]>(
    object: TThis | any,
    name: string,
    patch: Patch<TThis, TResult, TArgs>
): Unpatch {
    const original = resolveMethod(object, name);

    let patchInfo = original[patchInfoSym] as PatchInfo<TThis, TResult, TArgs>;
    if (!patchInfo) {
        patchInfo = new PatchInfo(original);

        const replacement = patchInfo.makeReplacementFunc();
        Object.assign(replacement, original);
        Object.defineProperty(replacement, patchInfoSym, {
            value: patchInfo,
            enumerable: false,
            writable: true,
            configurable: true
        });

        object[name] = replacement;
    }

    patchInfo.addPatch(patch);

    return () => unpatch(object, name, patch);
}

export function before<TThis, TResult, TArgs extends any[] = any[]>(
    object: any,
    name: string,
    before: BeforePatchFn<TThis, TResult, TArgs>,
    priority = PatchPriority.DEFAULT
): Unpatch {
    return patch(object, name, new Patch({ before, priority }));
}

export function instead<TThis, TResult, TArgs extends any[] = any[]>(
    object: any,
    name: string,
    instead: InsteadFn<TThis, TResult, TArgs>,
    priority = PatchPriority.DEFAULT
): Unpatch {
    return patch(object, name, new Patch({ instead, priority }));
}

export function after<TThis, TResult, TArgs extends any[] = any[]>(
    object: any,
    name: string,
    after: AfterPatchFn<TThis, TResult, TArgs>,
    priority = PatchPriority.DEFAULT
): Unpatch {
    return patch(object, name, new Patch({ after, priority }));
}

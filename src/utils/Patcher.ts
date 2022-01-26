import { Logger } from "./Logger";

const logger = new Logger("Patcher");

class Context<TThis, TResult> {
    thisObject: TThis;

    private _result: TResult | undefined;
    resultChanged = false;

    set result(value: TResult | undefined) {
        this._result = value;
        this.resultChanged = true;
    }

    get result(): TResult | undefined {
        return this._result;
    }

    constructor(thisObject: TThis, result: TResult | undefined) {
        this.thisObject = thisObject;
        this._result = result;
    }
}

class PatchContext<TThis, TResult, TArgs extends any[]> extends Context<TThis, TResult> {
    original: (...args: TArgs) => TResult;

    constructor(thisObject: TThis, result: TResult | undefined, original: (...args: TArgs) => TResult) {
        super(thisObject, result);
        this.original = original;
    }
}

class AfterContext<TThis, TResult> extends Context<TThis, TResult> {
    constructor(thisObject: TThis, result: TResult | undefined) {
        super(thisObject, result);
    }

    set result(value: TResult) {
        super.result = value;
    }

    get result(): TResult {
        return super.result as TResult;
    }
}

// TODO support multiple patches either by chaining or a single hook executing everything - check which is better for JS
export function patch<TThis, TResult, TArgs extends any[] = any[]>(object: TThis | any, name: string, hook: (ctx: PatchContext<TThis, TResult, TArgs>, ...args: TArgs) => TResult | void): () => void {
    const original = object[name];
    logger.info(`Patching ${original} with ${hook}`);
    object[name] = function patch(...args: TArgs) {
        const ctx = new PatchContext<TThis, TResult, TArgs>(this, undefined, original);
        const result = hook(ctx, ...args);
        if (result !== undefined) {
            ctx.result = result;
        }

        if (ctx.resultChanged) {
            return ctx.result;
        }
    };
    return () => {
        logger.info(`Unpatching ${hook} back to ${original}`);
        object[name] = original;
    };
}

export function before<TThis, TResult, TArgs extends any[] = any[]>(object: any, name: string, hook: (ctx: Context<TThis, TResult>, ...args: TArgs) => TResult | void): () => void {
    return patch<TThis, TResult, TArgs>(object, name, function before({ thisObject, original }, ...args) {
        const ctx = new Context<TThis, TResult>(thisObject, undefined);
        const result = hook(ctx, ...args);
        if (result !== undefined) {
            if (ctx.resultChanged && result !== ctx.result) {
                logger.warn("Hook return value is different than ctx.result");
            }

            ctx.result = result;
        }

        if (ctx.resultChanged) {
            return ctx.result;
        }

        return original.apply(thisObject, args);
    });
}

export function instead<TThis, TResult, TArgs extends any[] = any[]>(object: any, name: string, hook: (ctx: Context<TThis, TResult>, ...args: TArgs) => TResult): () => void {
    return patch<TThis, TResult, TArgs>(object, name, function instead({ thisObject }, ...args) {
        return hook(new Context<TThis, TResult>(thisObject, undefined), ...args);
    });
}

export function after<TThis, TResult, TArgs extends any[] = any[]>(object: any, name: string, hook: (ctx: AfterContext<TThis, TResult>, ...args: TArgs) => TResult | void): () => void {
    return patch<TThis, TResult, TArgs>(object, name, function after({ thisObject, original }, ...args) {
        const ctx = new AfterContext<TThis, TResult>(thisObject, original.apply(thisObject, args));
        const result = hook(ctx, ...args);
        if (result !== undefined) {
            ctx.result = result;
        }

        return ctx.result;
    });
}

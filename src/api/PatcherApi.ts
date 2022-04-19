import {
    Unpatch,
    before,
    PatchPriority,
    BeforePatchFn,
    InsteadFn,
    instead,
    AfterPatchFn,
    after,
    insteadDoNothing
} from "../utils/Patcher";

export class Patcher {
    private readonly _unpatches = [] as Unpatch[];

    public constructor(public readonly plugin: string) { }

    public before<T, R, A extends any[]>(object: T, name: string, fn: BeforePatchFn<T, R, A>, priority?: PatchPriority): Unpatch {
        const unpatch = before<T, R, A>(object, name, fn, priority, this.plugin);
        this._unpatches.push(unpatch);
        return unpatch;
    }

    public instead<T, R, A extends any[]>(object: T, name: string, fn: InsteadFn<T, R, A>, priority?: PatchPriority): Unpatch {
        const unpatch = instead<T, R, A>(object, name, fn, priority, this.plugin);
        this._unpatches.push(unpatch);
        return unpatch;
    }

    public insteadDoNothing(object: any, name: string): Unpatch {
        const unpatch = insteadDoNothing(object, name);
        this._unpatches.push(unpatch);
        return unpatch;
    }

    public after<T, R, A extends any[]>(object: T, name: string, fn: AfterPatchFn<T, R, A>, priority?: PatchPriority): Unpatch {
        const unpatch = after<T, R, A>(object, name, fn, priority, this.plugin);
        this._unpatches.push(unpatch);
        return unpatch;
    }

    public unpatchAll() {
        let unpatch;
        while ((unpatch = this._unpatches.pop())) {
            unpatch();
        }
    }
}

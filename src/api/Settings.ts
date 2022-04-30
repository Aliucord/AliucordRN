import { React } from "../metro";

/**
 * Casts types down to be less specific and also allow missing keys in Objects
 * CastDown<12> -> number
 */
type CastDown<T> =
    T extends number ? number :
    T extends string ? string :
    T extends boolean ? boolean :
    T extends Record<any, any> ? T & Record<string, any> :
    T;

/** 
 * Settings React Hook. Will automatically rerender your component and
 * save to settings on set()
 */
export function useSettings<T extends Record<string, any>>(settings: Settings<T>, defaults: T) {
    const initialValues = {};
    for (const [key, value] of Object.entries(defaults)) {
        initialValues[key] = settings.get(key, value);
    }
    const [state, setState] = React.useState(initialValues as T);
    return React.useMemo(() => new Proxy(state, {
        set(_, property, value) {
            const newState = { ...state };
            Object.defineProperty(newState, property, {
                value
            });
            setState(newState);
            settings.set(property as string, value);
            return true;
        }
    }), [state]);
}

/**
 * SettingsAPI.
 * For technical reasons, this class must be constructed using Settings.make, 
 * and NOT via new.
 */
export class Settings<Schema extends Record<string, any>> {
    private constructor(public readonly module: string, public readonly snapshot: Schema) { }

    // FIXME - find a better way to do this somehow
    // getSettings is an asynchronous method. Thus, an async factory method
    // is required to ensure the snapshot is ready before receiving any calls to other methods
    // An alternative would be making get async, but that would be very inconvenient.
    /**
     * Construct a new Settings instance.
     * Accepts a Schema as generic argument which will be used to validate 
     * and type calls to get and set
     * @param module Name of your module. Choose something meaningful as this will be used to 
     *               identify your settings
     * @returns Settings Instance
     */
    static async make<Schema = Record<string, never>>(module: string) {
        const snapshot = (await window.nativeModuleProxy.AliucordNative.getSettings(module)) ?? "{}";
        try {
            const data = JSON.parse(snapshot);
            if (typeof data !== "object")
                throw new Error("JSON data was not an object.");
            return new this<Schema>(module, data);
        } catch (err: any) {
            window.Aliucord.logger.error(`[SettingsAPI] Settings of module ${module} are corrupt and were cleared.`);
            return new this<Schema>(module, {} as Schema);
        }
    }

    /**
     * Get a settings item
     * @param key Key
     * @param defaultValue Default value to return in case no such setting exists 
     * @returns Setting if found, otherwise the default value
     */
    public get<K extends keyof Schema, T extends Schema[K]>(key: K, defaultValue: T): CastDown<T> {
        // @ts-ignore
        return this.snapshot[key] ?? defaultValue;
    }

    /**
     * Set a settings item
     * @param key Key
     * @param value New value
     */
    public async set<K extends keyof Schema>(key: K, value: Schema[K]) {
        const { snapshot } = this;
        snapshot[key] = value;
        return this._persist();
    }

    /**
     * Delete a setting
     * @param key Key
     */
    public async delete<K extends keyof Schema>(key: K) {
        if (key in this.snapshot) {
            delete this.snapshot[key];
            return this._persist();
        }
    }

    private _persist(): Promise<void> {
        return window.nativeModuleProxy.AliucordNative.writeSettings(this.module, JSON.stringify(this.snapshot, null, 2));
    }
}


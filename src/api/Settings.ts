import { React } from "../metro";
import { exists, readFile, writeFile } from "../native/fs";
import { SETTINGS_DIRECTORY } from "../utils/constants";

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
export function useSettings<T>(settings: Settings<T>) {
    const [, update] = React.useState(0);
    return React.useMemo(() => ({
        get<K extends keyof T, V extends T[K]>(key: K, defaultValue: V) {
            return settings.get(key, defaultValue);
        },
        set<K extends keyof T, V extends T[K]>(key: K, value: V) {
            settings.set(key, value);
            update(x => x + 1);
        }
    }), []);
}

function getPath(module: string) {
    return SETTINGS_DIRECTORY + module + ".json";
}

/**
 * SettingsAPI.
 * For technical reasons, this class must be constructed using Settings.make, 
 * and NOT via new.
 */
export class Settings<Schema> {
    public readonly snapshot!: Schema;

    public constructor(public readonly module: string) {
        const path = getPath(module);
        const fileSnapshot = exists(path) ? readFile(path) : "{}";
        try {
            const data = JSON.parse(fileSnapshot);
            if (typeof data !== "object")
                throw new Error("JSON data was not an object.");
            this.snapshot = data;
        } catch (err: any) {
            window.Aliucord.logger.error(`[SettingsAPI] Settings of module ${module} are corrupt and were cleared.`);
            this.snapshot = {} as Schema;
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
    public set<K extends keyof Schema>(key: K, value: Schema[K]) {
        const { snapshot } = this;
        snapshot[key] = value;
        return this._persist();
    }

    /**
     * Delete a setting
     * @param key Key
     */
    public delete<K extends keyof Schema>(key: K) {
        if (this.snapshot[key]) {
            delete this.snapshot[key];
            return this._persist();
        }
    }

    private _persist() {
        writeFile(getPath(this.module), JSON.stringify(this.snapshot, null, 2));
    }
}

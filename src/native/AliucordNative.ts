import { ReactNative } from "../metro";

/**
 * Aliucord's java native module
 * @private You should not be using this directly
 */
export const AliucordNative = ReactNative.NativeModules.AliucordNative as {
    listNativeModules: () => Promise<Record<string, string[]>>;
    checkPermissions: () => Promise<boolean>;
    requestPermissions: () => Promise<boolean>;
    download: (url: string, path: string) => Promise<void>;

    externalStorageDirectory: string;
    codeCacheDirectory: string;
};

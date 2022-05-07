declare global {
    const nativeModuleProxy: {
        AliucordNative: {
            externalStorageDirectory: string,
            download: (url: string, path: string) => Promise<void>;
        };
    };
}

export * from "../src/aliuhermes";

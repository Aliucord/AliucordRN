declare global {
    const nativeModuleProxy: {
        AliucordNative: {
            externalStorageDirectory: string,
            codeCacheDirectory: string,
            packageCodePath: string,
            download: (url: string, path: string) => Promise<void>;
            requestPermissions: () => Promise<boolean>;
            checkPermissions: () => Promise<boolean>;
        };
        DialogManagerAndroid: {
            getConstants: () => {
                buttonClicked: string;
                dismissed: string;
                buttonPositive: number;
                buttonNegative: number;
                buttonNeutral: number;
            };
            showAlert: (
                config: {
                    title?: string,
                    message?: string,
                    buttonPositive?: string,
                    buttonNegative?: string,
                    buttonNeutral?: string,
                    items?: string[],
                    cancelable?: boolean,
                },
                onError: (error: Error) => any,
                onAction: (action: string, key: number) => any
            ) => void;
        };
    };
}

export * from "../src/aliuhermes";

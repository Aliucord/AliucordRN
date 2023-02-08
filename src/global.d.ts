declare global {
    interface Window {
        Aliucord: typeof import("./Aliucord");
        React: typeof import("react");
        ReactNative: typeof import("react-native");
        [key: PropertyKey]: any;
    }
}

export { };

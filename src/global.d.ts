declare global {
    interface Window {
        Aliucord: typeof import("./Aliucord");
        [key: PropertyKey]: any;
    }
}

export { };

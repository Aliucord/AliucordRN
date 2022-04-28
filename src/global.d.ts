import * as Aliucord from "./Aliucord";

declare global {
    interface Window {
        Aliucord: typeof Aliucord;
        [key: PropertyKey]: any;
    }
}

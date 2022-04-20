import { Aliucord } from "./Aliucord";

declare global {
    interface Window {
        Aliucord: Aliucord;
        [key: PropertyKey]: any;
    }
}

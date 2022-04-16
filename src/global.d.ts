import { Aliucord } from "./Aliucord";

declare global {
    interface Window {
        Aliucord: Aliucord;
    }
}

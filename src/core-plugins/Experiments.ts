import Plugin from "../entities/Plugin";
import { getByProps, FluxDispatcher } from "../metro/index";

export default class Experiments extends Plugin {
    public start() {
        apply();

        // Make sure our change persists across account switches and other
        // things that re-open a connection.
        FluxDispatcher.subscribe("CONNECTION_OPEN", apply);
    }
}

function apply() {
    const User = getByProps("isDeveloper");
    Object.defineProperty(User, "isDeveloper", {
        get: () => true,
        set: () => {},
        configurable: true,
    });
}

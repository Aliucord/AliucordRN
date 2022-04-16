import NoTrack from "./NoTrack";
import Plugin from "../entities/Plugin";

const plugins: Array<typeof Plugin> = [NoTrack];

export function startAll() {
    for (const pluginClass of plugins) {
        const { name } = pluginClass;
        try {
            window.Aliucord.logger.info("Loading CorePlugin " + name);
            new pluginClass().start();
        } catch (e) {
            window.Aliucord.logger.error("Failed to start CorePlugin " + name, e);
        }
    }
}

import CommandHandler from "./CommandHandler";
import NoTrack from "./NoTrack";
import Plugin from "../entities/Plugin";
import CoreCommands from "./CoreCommands";

const plugins: Array<typeof Plugin> = [CommandHandler, CoreCommands, NoTrack];

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

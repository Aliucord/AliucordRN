import Plugin from "../entities/Plugin";
import CommandHandler from "./CommandHandler";
import CoreCommands from "./CoreCommands";
import NoTrack from "./NoTrack";
import Experiments from "./Experiments";

const plugins: Array<typeof Plugin> = [CommandHandler, CoreCommands, NoTrack, Experiments];

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

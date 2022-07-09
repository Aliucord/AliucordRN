import { aliucord } from "..";
import { Plugin } from "../entities/Plugin";
import Badges from "./Badges";
import CommandHandler from "./CommandHandler";
import CoreCommands from "./CoreCommands";
import NoTrack from "./NoTrack";

const plugins: Array<typeof Plugin> = [Badges, CommandHandler, CoreCommands, NoTrack];

export function startAll() {
    for (const pluginClass of plugins) {
        const { name } = pluginClass;
        try {
            aliucord.logger.info("Loading CorePlugin " + name);
            new pluginClass(aliucord.settings).start();
        } catch (e) {
            aliucord.logger.error("Failed to start CorePlugin " + name, e);
        }
    }
}

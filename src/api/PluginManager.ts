import Badges from "../core-plugins/Badges";
import CommandHandler from "../core-plugins/CommandHandler";
import CoreCommands from "../core-plugins/CoreCommands";
import NoTrack from "../core-plugins/NoTrack";
import { Plugin } from "../entities/Plugin";
import { readdir } from "../native/fs";
import { PLUGINS_DIRECTORY } from "../utils/constants";
import { Logger } from "../utils/Logger";
import { Settings } from "./Settings";

const logger = new Logger("PluginManager");
export const plugins = {} as Record<string, Plugin>;

export function isPluginEnabled(plugin: string) {
    return window.Aliucord.settings.get("plugins", {})[plugin] === true;
}

export function enablePlugin(plugin: string) {
    const plugins = window.Aliucord.settings.get("plugins", {});
    plugins[plugin] = true;
    window.aliucord.settings.set("plugins", plugins);
}

export function disablePlugin(plugin: string) {
    const plugins = window.Aliucord.settings.get("plugins", {});
    plugins[plugin] = false;
    window.Aliucord.settings.set("plugins", plugins);
}

export function startPlugins() {
    // TODO load from zips
    for (const file of readdir(PLUGINS_DIRECTORY)) {
        if (file.name.endsWith(".bundle")) {
            logger.info("Running " + file.name);
            const pluginClass = AliuHermes.run(PLUGINS_DIRECTORY + file.name) as typeof Plugin;

            const { name } = pluginClass;
            if (name in plugins) throw new Error(`Plugin ${name} already registered`);

            try {
                logger.info(`Loading Plugin ${name}...`);
                Settings.make(name).then(settings => {
                    const plugin = plugins[name] = new pluginClass(settings);
                    plugin.start();
                });
            } catch (err) {
                logger.error(`Failed to load Plugin ${name}\n`, err);
            }
        }
    }
}

export function startCorePlugins() {
    for (const pluginClass of [Badges, CommandHandler, CoreCommands, NoTrack]) {
        const { name } = pluginClass;
        try {
            logger.info("Loading CorePlugin " + name);
            new pluginClass(window.Aliucord.settings).start();
        } catch (e) {
            logger.error("Failed to start CorePlugin " + name, e);
        }
    }
}

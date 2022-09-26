import Badges from "../core-plugins/Badges";
import CommandHandler from "../core-plugins/CommandHandler";
import CoreCommands from "../core-plugins/CoreCommands";
import NoTrack from "../core-plugins/NoTrack";
import { Plugin } from "../entities/Plugin";
import { Toasts } from "../metro";
import { readdir } from "../native/fs";
import { getAssetId } from "../utils";
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
    window.Aliucord.settings.set("plugins", plugins);
    Toasts.open({ content: `Enabled ${plugin}`, source: getAssetId("Check") });
    logger.info(`Enabled plugin: ${plugin}`);
}

export function disablePlugin(plugin: string) {
    const plugins = window.Aliucord.settings.get("plugins", {});
    plugins[plugin] = false;
    window.Aliucord.settings.set("plugins", plugins);
    logger.info(`Disabled plugin: ${plugin}`);
    Toasts.open({ content: `Disabled ${plugin}`, source: getAssetId("Small") });
}

export async function startPlugins() {
    for (const file of readdir(PLUGINS_DIRECTORY)) {
        if (file.name.endsWith(".zip")) {
            logger.info(`Running Plugin ZIP: ${file.name}`);
            const zip = new ZipFile(PLUGINS_DIRECTORY + file.name, 0, "r");
            try {
                zip.openEntry("manifest.json");
                const manifestBuffer = JSON.parse(zip.readEntry("text")) as any;
                zip.closeEntry();

                zip.openEntry("index.js.bundle");
                const pluginBuffer = zip.readEntry("binary");
                zip.closeEntry();

                const pluginClass = AliuHermes.run(file.name, pluginBuffer) as typeof Plugin;

                const { name } = pluginClass;
                if (name in plugins) throw new Error(`Plugin ${name} already registered`);
                try {
                    logger.info(`Loading Plugin ${name}...`);
                    const plugin = plugins[name] = new pluginClass(new Settings(name));
                    plugin.manifest = manifestBuffer;
                    if (isPluginEnabled(plugin.name)) plugin.start();
                } catch (err) {
                    logger.error(`Failed while loading Plugin: ${name}\n`, err);
                }
            } catch (err) {
                logger.error(`Failed while loading Plugin ZIP: ${file.name}\n`, err);
                zip.close();
            } finally {
                await zip.close();
            }
        }
    }
}

export function startCorePlugins() {
    for (const pluginClass of [Badges, CommandHandler, CoreCommands, NoTrack]) {
        const { name } = pluginClass;
        try {
            logger.info("Loading CorePlugin: " + name);
            new pluginClass(window.Aliucord.settings).start();
        } catch (e) {
            logger.error("Failed to start CorePlugin: " + name, e);
        }
    }
}

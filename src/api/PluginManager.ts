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

const logger = new Logger("PluginManager");
export const plugins = {} as Record<string, Plugin>;

export function isPluginEnabled(plugin: string) {
    return window.Aliucord.settings.get("plugins", {})[plugin] !== false;
}

export async function enablePlugin(plugin: string) {
    const settingsPlugins = window.Aliucord.settings.get("plugins", {});
    if (isPluginEnabled(plugin)) throw new Error(`Plugin ${plugin} is already enabled.`);

    settingsPlugins[plugin] = true;
    window.Aliucord.settings.set("plugins", settingsPlugins);
    try {
        const bundleZip = new ZipFile(PLUGINS_DIRECTORY + `${plugin}.zip`, 0, "r");
        const pluginBuffer = loadPluginBundle(bundleZip);

        bundleZip.close();

        const pluginClass = AliuHermes.run(plugin, pluginBuffer) as typeof Plugin;
        const enabledPlugin = plugins[plugin] = new pluginClass(plugins[plugin].manifest);

        try {
            await enabledPlugin.start();
            enabledPlugin.enabled = true;
        } catch (err) {
            logger.error(`Failed while trying to start plugin: ${enabledPlugin.manifest.name}`, err);
        }

        Toasts.open({ content: `Enabled ${plugin}`, source: getAssetId("Check") });
        logger.info(`Enabled plugin: ${plugin}`);
    } catch (err) {
        logger.error(`Failed while trying to start plugin: ${plugin}`, err);
    }


}

export async function disablePlugin(plugin: string) {
    const settingsPlugins = window.Aliucord.settings.get("plugins", {});

    try {
        await plugins[plugin].stop();
        plugins[plugin].enabled = false;
        settingsPlugins[plugin] = false;
    } catch (err) {
        logger.error(`Failed while stopping plugin: ${plugin}\n`, err);
    }

    window.Aliucord.settings.set("plugins", settingsPlugins);
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
                const manifest = JSON.parse(zip.readEntry("text"));
                zip.closeEntry();

                if (manifest.name in plugins) throw new Error(`Plugin ${manifest.name} already registered`);

                const pluginBuffer = loadPluginBundle(zip);

                const pluginClass = AliuHermes.run(file.name, pluginBuffer) as typeof Plugin;
                try {
                    if (pluginClass.prototype instanceof Plugin) {
                        if (manifest.name !== pluginClass.name) throw new Error(`Plugin ${manifest.name} must export a class named ${manifest.name}`);
                        logger.info(`Loading Plugin ${manifest.name}...`);
                        const plugin = plugins[manifest.name] = new pluginClass(manifest);
                        if (!isPluginEnabled(manifest.name)) {
                            plugin.enabled = false;
                            continue;
                        }
                        try {
                            await plugin.start();
                            plugin.enabled = true;
                        } catch (err: any) {
                            logger.error(`Failed while trying to start plugin: ${plugin.manifest.name}`, err);
                            Toasts.open({ content: `${plugin.manifest.name} had an error.`, source: getAssetId("Small") });
                            plugin.errors = err.stack;
                        }
                    } else throw new Error(`Plugin ${manifest.name} does not export a valid Plugin`);
                } catch (err) {
                    logger.error(`Failed while loading Plugin: ${manifest.name}\n`, err);
                }
            } catch (err) {
                logger.error(`Failed while loading Plugin ZIP: ${file.name}\n`, err);
            } finally {
                zip.close();
            }
        }
    }
}

export function startCorePlugins() {
    for (const pluginClass of [Badges, CommandHandler, CoreCommands, NoTrack]) {
        const { name } = pluginClass;
        try {
            logger.info("Loading CorePlugin: " + name);
            new pluginClass({ name, description: "", version: "1.0.0", authors: [{ name: "Aliucord", id: "000000000000000000" }] }).start();
        } catch (e) {
            logger.error("Failed to start CorePlugin: " + name, e);
        }
    }
}

function loadPluginBundle(zip: ZipFile) {
    zip.openEntry("index.js.bundle");
    const pluginBuffer = zip.readEntry("binary");
    zip.closeEntry();

    return pluginBuffer;
}

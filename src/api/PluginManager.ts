import Badges from "../core-plugins/Badges";
import CommandHandler from "../core-plugins/CommandHandler";
import CoreCommands from "../core-plugins/CoreCommands";
import NoTrack from "../core-plugins/NoTrack";
import ChatGuard from "../core-plugins/ChatGuard";
import { Plugin, PluginManifest } from "../entities";
import { Toasts } from "../metro";
import { deleteFile, exists, readdir } from "../native/fs";
import { getAssetId, Logger } from "../utils";
import { PLUGINS_DIRECTORY } from "../utils/constants";

const logger = new Logger("PluginManager");

export const plugins = {} as Record<string, Plugin>;
export const corePlugins = {} as Record<string, Plugin>;

export function isPluginEnabled(plugin: string) {
    return window.Aliucord.settings.get("plugins", {})[plugin] !== false;
}

export async function enablePlugin(plugin: string) {
    if (isPluginEnabled(plugin)) return;
    const settingsPlugins = window.Aliucord.settings.get("plugins", {});
    settingsPlugins[plugin] = true;
    window.Aliucord.settings.set("plugins", settingsPlugins);

    await loadPlugin(plugin);
    await startPlugin(plugin);
}

export async function disablePlugin(plugin: string) {
    if (!isPluginEnabled(plugin)) return;
    const settingsPlugins = window.Aliucord.settings.get("plugins", {});

    try {
        logger.info(`Stopping plugin ${plugin}`);
        await plugins[plugin].stop();
        plugins[plugin].enabled = false;
    } catch (err) {
        logger.error(`Failed to stop plugin ${plugin}\n`, err);
    }

    settingsPlugins[plugin] = false;
    window.Aliucord.settings.set("plugins", settingsPlugins);
}

export async function uninstallPlugin(plugin: string): Promise<boolean> {
    const settingsPlugins = window.Aliucord.settings.get("plugins", {});

    try {
        logger.info(`Uninstalling plugin ${plugin}...`);

        const pluginInstance = plugins[plugin];
        if (pluginInstance.localPath && exists(pluginInstance.localPath)) {
            deleteFile(pluginInstance.localPath);

            await pluginInstance.stop();
            delete plugins[plugin];
            delete settingsPlugins[plugin];

            Toasts.open({ content: `Uninstalled plugin: ${plugin}`, source: getAssetId("trash") });
        }
    } catch (err) {
        logger.error(`Failed to uninstall plugin ${plugin}\n`, err);
        Toasts.open({ content: `Failed to uninstall plugin: ${plugin}`, source: getAssetId("Small") });
        return false;
    }

    window.Aliucord.settings.set("plugins", settingsPlugins);
    return true;
}

export async function startPlugins() {
    for (const file of readdir(PLUGINS_DIRECTORY)) {
        if (!file.name.endsWith(".zip")) continue;

        const plugin = await loadPlugin(file.name);
        if (!plugin) continue;

        if (isPluginEnabled(plugin.name)) {
            await startPlugin(plugin.name);
        }
    }
}

export async function startCorePlugins() {
    const pluginClasses = [
        Badges,
        CommandHandler,
        CoreCommands,
        NoTrack,
        ChatGuard
    ];

    for (const pluginClass of pluginClasses) {
        const { name } = pluginClass;

        try {
            logger.info(`Starting core plugin ${name}`);

            const plugin = new pluginClass({
                name,
                description: "",
                version: "1.0.0",
                repo: "https://github.com/Aliucord/AliucordRN",
                authors: [{ name: "Aliucord", id: "000000000000000000" }]
            });

            corePlugins[name] = plugin;
            await plugin.start();
        } catch (err: any) {
            if (plugins[name]) plugins[name].errors.push(err?.stack ?? err);
            logger.error("Failed to start " + name, err);
        }
    }
}

async function loadPlugin(pluginZip: string): Promise<Plugin | null> {
    if (plugins[pluginZip]) return plugins[pluginZip];

    logger.info(`Loading plugin from ${pluginZip}`);

    let pluginName: string | null = null;

    try {
        const zip = new ZipFile(PLUGINS_DIRECTORY + pluginZip, 0, "r");

        zip.openEntry("manifest.json");
        const manifest = JSON.parse(zip.readEntry("text")) as PluginManifest;
        pluginName = manifest.name;
        zip.closeEntry();

        if (!pluginName)
            throw new Error(`Plugin ${pluginZip}.zip contains invalid manifest`);
        if (plugins[pluginName]) {
            logger.info(`Plugin ${pluginName} already loaded, skipping`);
            return plugins[manifest.name];
        }

        zip.openEntry("index.js.bundle");
        const pluginBuffer = zip.readEntry("binary");
        zip.closeEntry();
        zip.close();

        const pluginClass = AliuHermes.run(pluginZip, pluginBuffer) as typeof Plugin;
        if (!(pluginClass?.prototype instanceof Plugin))
            throw new Error(`Plugin ${pluginName} does not export a valid Plugin`);
        if (pluginName !== pluginClass.name)
            throw new Error(`Plugin ${pluginName} must export a class named ${pluginName}`);

        const loadedPlugin = new pluginClass(manifest);
        // @ts-ignore
        loadedPlugin.pluginBuffer = pluginBuffer;
        loadedPlugin.enabled = false;
        loadedPlugin.localPath = PLUGINS_DIRECTORY + pluginZip;
        plugins[manifest.name] = loadedPlugin;

        return loadedPlugin;
    } catch (err: any) {
        window.Aliucord.errors[`Error loading plugin ${pluginName} from ${pluginZip}`] = err?.stack ?? err;
        logger.error(`Error loading plugin ${pluginName} from ${pluginZip}`, err);
        Toasts.open({
            content: `Error trying to load plugin ${pluginName}`,
            source: getAssetId("Small")
        });
        return null;
    }
}

async function startPlugin(plugin: string) {
    const loadedPlugin = plugins[plugin];
    if (!loadedPlugin)
        throw new Error(`Plugin ${plugin} has not been loaded!`);
    if (loadedPlugin.enabled)
        return;

    try {
        logger.info(`Starting plugin ${plugin}`);
        await loadedPlugin.start();
        loadedPlugin.enabled = true;
    } catch (err: any) {
        loadedPlugin.errors.push(err?.stack ?? err);
        logger.error(`Failed while starting plugin: ${loadedPlugin.manifest.name}`, err);
        Toasts.open({
            content: `${loadedPlugin.manifest.name} had an error while starting.`,
            source: getAssetId("Small")
        });
    }
}

import { Settings, startCorePlugins, startPlugins } from "./api";
import { mkdir } from "./native/fs";
import patchTheme from "./themer/patchTheme";
import patchSettings from "./ui/patchSettings";
import { PLUGINS_DIRECTORY, SETTINGS_DIRECTORY, THEME_DIRECTORY } from "./utils/constants";
import { startDebugWs, startReactDevTools } from "./utils/debug";
import { Logger } from "./utils/Logger";

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    plugins: Record<string, boolean>;
    theme: string;
}

export * as pluginManager from "./api/PluginManager";
export const logger = new Logger("Aliucord");
export let settings: Settings<SettingsSchema>;

let aliucordLoaded = false;

export async function load() {
    if (aliucordLoaded) throw "no";
    aliucordLoaded = true;

    logger.info("Loading...");

    try {
        mkdir(PLUGINS_DIRECTORY);
        mkdir(THEME_DIRECTORY);
        mkdir(SETTINGS_DIRECTORY);

        settings = new Settings("Aliucord");
        patchSettings();
        patchTheme();

        await startCorePlugins();
        await startPlugins();
        startReactDevTools();
        startDebugWs();

    } catch (err) {
        logger.error("Failed to load", err);
    }
}

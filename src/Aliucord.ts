import { startCorePlugins, startPlugins } from "./api/PluginManager";
import { Settings } from "./api/Settings";
import { themerInit } from "./api/Themer";
import { mkdir } from "./native/fs";
import patchSettings from "./ui/patchSettings";
import patchTheme from "./ui/patchTheme";
import { PLUGINS_DIRECTORY, SETTINGS_DIRECTORY, THEME_DIRECTORY } from "./utils/constants";
import { startDebugWs } from "./utils/debug/DebugWS";
import { startReactDevTools } from "./utils/debug/ReactDevTools";
import { Logger } from "./utils/Logger";

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    plugins: Record<string, boolean>;
    enableAMOLEDTheme: boolean;
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

        await themerInit();
        await startCorePlugins();
        await startPlugins();
        startReactDevTools();
        startDebugWs();
    } catch (err) {
        logger.error("Failed to load", err);
    }
}

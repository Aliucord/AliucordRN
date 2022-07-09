import { PluginManager } from "./api";
import { Settings } from "./api/Settings";
import * as CorePlugins from "./core-plugins/index";
import { mkdir } from "./native/fs";
import patchSettings from "./ui/patchSettings";
import { PLUGINS_DIRECTORY, SETTINGS_DIRECTORY } from "./utils/constants";
import { DebugWS } from "./utils/debug/DebugWS";
import { ReactDevTools } from "./utils/debug/ReactDevTools";
import { Logger } from "./utils/Logger";

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    plugins: Record<string, boolean>;
    debugWS: boolean;
}
export class Aliucord {
    logger = new Logger("Aliucord");
    settings!: Settings<SettingsSchema>;

    debugWS = new DebugWS();
    reactDevTools = new ReactDevTools();

    pluginManager: PluginManager = new PluginManager(this);

    async load() {
        try {
            this.logger.info("Loading...");

            mkdir(PLUGINS_DIRECTORY);
            mkdir(SETTINGS_DIRECTORY);

            this.settings = await Settings.make("Aliucord");

            CorePlugins.startAll();

            this.reactDevTools.connect();
            this.debugWS.start();

            patchSettings();

            this.pluginManager.load();
        } catch (error) {
            this.logger.error(error as string | Error);
        }
    }
}

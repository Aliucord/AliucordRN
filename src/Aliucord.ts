import { PluginManager } from "./api";
import { Settings } from "./api/Settings";
import * as CorePlugins from "./core-plugins/index";
import * as Metro from "./metro";
import { mkdir } from "./native/fs";
import { checkPermissions, requestPermissions } from "./native/permissions";
import patchSettings from "./ui/patchSettings";
import { ALIUCORD_DIRECTORY, PLUGINS_DIRECTORY, SETTINGS_DIRECTORY } from "./utils/constants";
import { DebugWS } from "./utils/debug/DebugWS";
import { ReactDevTools } from "./utils/debug/ReactDevTools";
import { Logger } from "./utils/Logger";

function initWithPerms() {
    if (!AliuFS.exists(PLUGINS_DIRECTORY)) AliuFS.mkdir(PLUGINS_DIRECTORY);
    if (!AliuFS.exists(SETTINGS_DIRECTORY)) AliuFS.mkdir(SETTINGS_DIRECTORY);
}

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    plugins: Record<string, boolean>;
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

            // TODO move to bootstrap
            checkPermissions().then(granted => {
                if (granted) initWithPerms();
                else {
                    Metro.ReactNative.Alert.alert(
                        "Storage Access",
                        "Aliucord needs access to your storage to load plugins and themes.",
                        [{
                            text: "OK",
                            onPress: () => requestPermissions().then(permissionGranted => {
                                if (permissionGranted) initWithPerms();
                                else alert("Aliucord needs access to your storage to load plugins and themes.");
                            })
                        }]
                    );
                }
            });

            mkdir(ALIUCORD_DIRECTORY);
            mkdir(SETTINGS_DIRECTORY);
            mkdir(PLUGINS_DIRECTORY);

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

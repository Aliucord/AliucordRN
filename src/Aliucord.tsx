import { checkPermissions, requestPermissions } from "./AliucordNative";
import { Commands } from "./api/Commands";
import { Settings } from "./api/SettingsAPI";
import * as CorePlugins from "./core-plugins/index";
import * as Metro from "./metro";
import patchSettings from "./ui/patchSettings";
import * as AliuConstants from "./utils/constants";
import { DebugWS } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";
import * as Patcher from "./utils/Patcher";

function initWithPerms() {
    // TODO
}

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    plugins: Record<string, boolean>;
}
export class Aliucord {
    settings!: Settings<SettingsSchema>;
    logger = new Logger("Aliucord");
    debugWS = new DebugWS();

    Constants = AliuConstants;

    Commands = Commands;
    /**
     * Metro. Module Store
     */
    Metro = Metro;
    Patcher = Patcher;

    async load() {
        this.settings = await Settings.make("Aliucord");

        try {
            this.logger.info("Loading...");

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

            CorePlugins.startAll();

            this.debugWS.start();

            // Needs to be hardcoded instead of variable so this code is correcty
            // detected as unreachable and not included in build.
            // if (variable) still crashes
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // CAUSES CRASHES
                // "lateinit property audioManager has not been initialized"
                const { ReactDevTools } = await import("./utils/debug/ReactDevTools");
                new ReactDevTools().connect();
            }

            patchSettings();
        } catch (error) {
            this.logger.error(error as string | Error);
        }
    }
}

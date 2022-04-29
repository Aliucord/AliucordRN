import { Settings } from "./api/Settings";
import * as CorePlugins from "./core-plugins/index";
import * as Metro from "./metro";
import { checkPermissions, requestPermissions } from "./native";
import patchSettings from "./ui/patchSettings";
import { startDebugWs } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";

function initWithPerms() {
    // TODO
}

interface SettingsSchema {
    autoUpdateAliucord: boolean;
    autoUpdatePlugins: boolean;
    disablePluginsOnCrash: boolean;
    debugWS: boolean;
    plugins: Record<string, boolean>;
}

export let settings: Settings<SettingsSchema>;
export const logger = new Logger("AliucordMain");
export * as Metro from "./metro";
export async function load() {
    settings = await Settings.make("Aliucord");

    try {
        logger.info("Loading...");

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

        if (settings.get("debugWS", false)) {
            startDebugWs();
        }

        // Needs to be hardcoded instead of variable so this code is correcty
        // detected as unreachable and not included in build.
        // if (variable) still crashes
        // eslint-disable-next-line no-constant-condition
        if (false) {
            // CAUSES CRASHES
            // "lateinit property audioManager has not been initialized"
            const { startReactDevTools } = await import("./utils/debug/ReactDevTools");
            startReactDevTools();
        }

        patchSettings();
    } catch (error) {
        logger.error(error as string | Error);
    }
}

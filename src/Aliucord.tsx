import { Commands } from "./api/Commands";
import * as AliuConstants from "./constants";
import * as CorePlugins from "./core-plugins/index";
import * as Metro from "./metro";
import { getByProps } from "./metro/index";
import patchSettings from "./ui/patchSettings";
import { DebugWS } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";
import * as Patcher from "./utils/Patcher";

async function checkPermissions() {
    const Permissions = getByProps("PERMISSIONS", "request");

    const granted = await Permissions.request(Permissions.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
        title: "Storage Access",
        message: "Aliucord needs access to your storage to load plugins and themes."
    });

    return granted === Permissions.RESULTS.GRANTED;
}

function initWithPerms() {
    // TODO
}

export class Aliucord {
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
        try {
            checkPermissions().then(granted => {
                if (granted) initWithPerms();
                else alert("Aliucord cannot function without permissions.");
            });

            this.logger.info("Loading...");

            Metro._initMetro();

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

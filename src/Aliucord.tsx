import { Commands } from "./api/Commands";
import * as Metro from "./metro";
import { AliucordSettings } from "./ui/AliucordSettings";
import { DebugWS } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";
import * as CorePlugins from "./core-plugins/index";

export class Aliucord {
    logger = new Logger("Aliucord");
    debugWS = new DebugWS();

    Commands = Commands;
    Metro = Metro;

    async load() {
        try {
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

            new AliucordSettings().patch();
        } catch (error) {
            this.logger.error(error as string | Error);
        }
    }
}

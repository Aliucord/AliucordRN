import * as Metro from "./metro";
import { AliucordSettings } from "./ui/AliucordSettings";
import { DebugWS } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";

export class Aliucord {
    logger: Logger = new Logger("Aliucord");

    debugWS: DebugWS = new DebugWS();

    Metro = Metro;

    async load() {
        try {
            this.logger.info("Loading...");

            Metro._initMetro();

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

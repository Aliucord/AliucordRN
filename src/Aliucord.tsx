import { AliucordSettings } from "./ui/AliucordSettings";
import { DebugWS } from "./utils/debug/DebugWS";
import { ReactDevTools } from "./utils/debug/ReactDevTools";
import { Logger } from "./utils/Logger";

export class Aliucord {
    logger: Logger = new Logger("Aliucord");

    debugWS: DebugWS = new DebugWS();
    reactDevTools: ReactDevTools = new ReactDevTools();

    load() {
        try {
            this.logger.info("Loading...");

            this.debugWS.start();
            this.reactDevTools.connect();

            new AliucordSettings().patch();
        } catch (error) {
            this.logger.error(error as string | Error);
        }
    }
}

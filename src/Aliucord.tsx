import { Commands } from "./api/Commands";
import * as CorePlugins from "./core-plugins/index";
import * as Metro from "./metro";
import { AliucordSettings } from "./ui/AliucordSettings";
import { DebugWS } from "./utils/debug/DebugWS";
import { Logger } from "./utils/Logger";
import * as Patcher from './utils/Patcher';

export class Aliucord {
    logger = new Logger("Aliucord");
    debugWS = new DebugWS();

    Commands = Commands;
    Metro = Metro;
    Patcher = Patcher;

    async load() {
        try {
            this.logger.info("Loading...");

            Metro._initMetro();

            CorePlugins.startAll();

            this.debugWS.start();


            new AliucordSettings().patch();
        } catch (error) {
            this.logger.error(error as string | Error);
        }
    }
}
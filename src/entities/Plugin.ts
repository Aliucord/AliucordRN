import { Commands } from "../api/Commands";
import { Logger } from "../utils/Logger";
import { Patcher } from "../api/PatcherApi";

export default class Plugin {
    public readonly commands = new Commands(this.name);
    public readonly logger = new Logger(this.name);
    public readonly patcher = new Patcher(this.name);

    public get name() {
        return this.constructor.name;
    }

    public start() {
        //
    }

    public stop() {
        //
    }
}

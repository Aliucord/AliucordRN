import { Commands } from "../api/Commands";
import { Logger } from "../utils/Logger";

export default class Plugin {
    public readonly commands: Commands;
    public readonly logger: Logger;

    public constructor() {
        this.commands = new Commands(this.constructor.name);
        this.logger = new Logger(this.constructor.name);
    }

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

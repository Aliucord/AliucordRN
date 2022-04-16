import { Logger } from "../utils/Logger";

export default class Plugin {
    public readonly logger: Logger;

    public constructor() {
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

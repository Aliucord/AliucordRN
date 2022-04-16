import { getByProps } from "../metro";

const DiscordLogger = getByProps("setLogFn").default;

export class Logger {
    private discordLogger;

    public constructor(public tag: string) {
        this.discordLogger = new DiscordLogger(`Aliucord:${tag}`);
    }

    private _format(messages: any[]) {
        let str = `[${this.tag}]`;
        for (const msg of messages) {
            str += " ";
            str += msg instanceof Error ? msg.stack ?? msg.message : String(msg);
        }

        return str;
    }

    // Declared as fields so you can destructure without breaking `this`

    info = (...messages: any[]) => {
        this.discordLogger.info(...messages);
        console.info(this._format(messages));
    };

    warn = (...messages: any[]) => {
        this.discordLogger.warn(...messages);
        console.warn(this._format(messages));
    };

    error = (...messages: any[]) => {
        this.discordLogger.error(...messages);
        console.error(this._format(messages));
    };

    complexLog = (object: any, name: string | undefined = undefined, indent = 0, log = this.info) => {
        if (name !== undefined) {
            log("  ".repeat(indent) + name + ":");
            indent++;
        }
        for (const propertyName in object) {
            const propertyText = "  ".repeat(indent) + propertyName + ": ";
            try {
                const property = object[propertyName];
                if (typeof property === "object") {
                    this.complexLog(property, propertyName, indent, log);
                } else {
                    log(propertyText + property);
                }
            } catch (error) {
                log(propertyText + error);
            }
        }
    };
}

export class Logger {
    public constructor(public tag: string) {}

    private _format(messages: any[]) {
        let str = `[${this.tag}]`;
        for (const msg of messages) {
            str += " ";
            str += msg instanceof Error ? msg.stack ?? msg.message : String(msg);
        }

        return str;
    }

    info(...messages: any[]) {
        console.info(this._format(messages));
    }

    warn(...messages: any[]) {
        console.warn(this._format(messages));
    }

    error(...messages: any[]) {
        console.error(this._format(messages));
    }

    complexLog(object: any, name: string | undefined = undefined, indent = 0, log = this.info) {
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
    }
}

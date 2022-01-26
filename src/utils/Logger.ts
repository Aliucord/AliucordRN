export class Logger {
    module: string;

    constructor(module: string) {
        this.module = module;
    }

    format(message: string) {
        return `[${this.module}] ${message}`;
    }

    info(message: string) {
        console.log(this.format(message));
    }

    warn(message: string) {
        console.warn(this.format(message));
    }

    error(message: string | Error) {
        console.error(this.format(message instanceof Error ? message.stack ?? message.message : message));
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

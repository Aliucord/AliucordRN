import { getByProps } from "../metro";

const DiscordLogger = getByProps("setLogFn").default;

export class Logger extends DiscordLogger {
    log: (...messages: any[]) => void;
    info: (...messages: any[]) => void;
    warn: (...messages: any[]) => void;
    error: (...messages: any[]) => void;
    trace: (...messages: any[]) => void;
    verbose: (...messages: any[]) => void;

    public constructor(tag: string) {
        super(`Aliucord:${tag}`);

        const { log, info, warn, error, trace, verbose } = this;
        
        this.log = (...messages: any[]) => {
            log(...messages);
            this._formatErrors(messages);
            console.log(`[${tag}]`);
            console.log(...messages);
        };

        this.info = (...messages: any[]) => {
            info(...messages);
            this._formatErrors(messages);
            console.log(`[${tag}]`);
            console.info(...messages);
        };

        this.warn = (...messages: any[]) => {
            warn(...messages);
            this._formatErrors(messages);
            console.log(`[${tag}]`);
            console.warn(...messages);
        };

        this.error = (...messages: any[]) => {
            error(...messages);
            this._formatErrors(messages);
            console.error(`[${tag}]`);
            console.error(...messages);
        };

        this.trace = (...messages: any[]) => {
            trace(...messages);
            this._formatErrors(messages);
            console.log(`[${tag}]`);
            console.trace(...messages);
        };

        this.verbose = (...messages: any[]) => {
            verbose(...messages);
            this._formatErrors(messages);
            console.log(`[${tag}]`);
            console.debug(...messages);
        };
    }

    private _formatErrors(messages: any[]) {
        for (let i = 0, len = messages.length; i < len; i++) {
            const msg = messages[i];
            if (msg instanceof Error) messages[i] = msg.stack ?? msg.message;
        }
    }
}

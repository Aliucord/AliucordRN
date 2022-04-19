import { getByProps } from "../metro";

const DiscordLogger = getByProps("setLogFn").default;

export class Logger extends DiscordLogger {
    log: (...messages: any[]) => void;
    info: (...messages: any[]) => void;
    warn: (...messages: any[]) => void;
    error: (...messages: any[]) => void;
    trace: (...messages: any[]) => void;
    verbose: (...messages: any[]) => void;

    public constructor(public tag: string) {
        super(`Aliucord:${tag}`);

        const { log, info, warn, error, trace, verbose } = this;

        this.log = (...messages: any[]) => {
            log(...messages);
            this._log(console.log, messages);
        };

        this.info = (...messages: any[]) => {
            info(...messages);
            this._log(console.info, messages);
        };

        this.warn = (...messages: any[]) => {
            warn(...messages);
            this._log(console.warn, messages);
        };

        this.error = (...messages: any[]) => {
            error(...messages);
            this._log(console.error, messages);
        };

        this.trace = (...messages: any[]) => {
            trace(...messages);
            this._log(console.trace, messages);
        };

        this.verbose = (...messages: any[]) => {
            verbose(...messages);
            this._log(console.debug, messages);
        };
    }

    private _log(log: (m: any) => void, messages: any[]) {
        log(`[${this.tag}]`);
        for (const msg of messages) {
            if (msg instanceof Error) log(msg.stack ?? msg.message);
            else log(msg);
        }
    }
}

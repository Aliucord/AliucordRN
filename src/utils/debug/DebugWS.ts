import { Logger } from "../Logger";
import { makeAsyncEval } from "../misc";
import { before } from "../patcher";

const logger = new Logger("DebugWS");

export class DebugWS {
    socket: WebSocket | null = null;
    patched: boolean = false;

    start() {
        if (this.socket) return;
        this.socket = new WebSocket("ws://localhost:3000");

        const logger = new Logger("DebugWS");
        logger.info("Connecting to debug ws");

        this.socket.addEventListener("open", () => logger.info("Connected with debug websocket"));
        this.socket.addEventListener("error", e => logger.error((e as ErrorEvent).message));
        this.socket.addEventListener("message", async message => {
            try {
                const { data } = message;
                if (data.includes("await")) {
                    console.log(await eval(makeAsyncEval(data)));
                } else {
                    console.log(eval(data));
                }
            } catch (e) {
                logger.error(e as Error | string);
            }
        });
        this.socket.addEventListener("close", () => {
            logger.info("Disconnected from debug websocket, reconnecting in 3 seconds");
            this.socket = null;
            setTimeout(this.start, 3000);
        });

        if (!this.patched) {
            before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
                if (this.socket?.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ level, message }));
                }
            });
            this.patched = true;
        }
    }
}

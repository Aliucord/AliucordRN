import { Logger } from "../Logger";
import { before } from "../Patcher";

const logger = new Logger("DebugWS");

export class DebugWS {
    socket: WebSocket | undefined;

    start() {
        logger.info("Connecting to debug ws");
        this.socket = new WebSocket("ws://localhost:9090");

        this.socket.addEventListener("open", () => logger.info("Connected with debug websocket"));
        this.socket.addEventListener("error", e => logger.error((e as any).message));
        this.socket.addEventListener("message", message => {
            try {
                logger.info(eval(message.data));
            } catch (e) {
                logger.error(e as Error | string);
            }
        });

        before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ level, message }));
            }
        });
    }
}

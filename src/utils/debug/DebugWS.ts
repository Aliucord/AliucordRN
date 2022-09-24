import { Logger } from "../Logger";
import { makeAsyncEval } from "../misc";
import { before } from "../patcher";

const logger = new Logger("DebugWS");
let socket: WebSocket;

export function startDebugWs() {
    if (socket) throw "no";

    logger.info("Connecting to debug ws");
    socket = new WebSocket("ws://localhost:3000");

    socket.addEventListener("open", () => logger.info("Connected with debug websocket"));
    socket.addEventListener("error", e => logger.error((e as ErrorEvent).message));
    socket.addEventListener("message", async message => {
        try {
            const { data } = message;
            if (data.includes("await")) {
                console.log(await (0, eval)(makeAsyncEval(data)));
            } else {
                console.log((0, eval)(data));
            }
        } catch (e) {
            logger.error(e as Error | string);
        }
    });

    before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ level, message }));
        }
    });
}


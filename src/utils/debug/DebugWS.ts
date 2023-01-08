import { settings } from "../../Aliucord";
import { Logger } from "../Logger";
import { makeAsyncEval } from "../misc";
import { before } from "../patcher";

const logger = new Logger("DebugWS");
let socket: WebSocket | null = null;
let patched = false;

export function startDebugWs() {
    if (socket) return;
    if (!settings.get("debugWS", false)) return;

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
    socket.addEventListener("close", () => {
        socket = null;
        if (settings.get("debugWS", false)) {
            logger.info("Disconnected from debug websocket, reconnecting in 3 seconds");
            setTimeout(startDebugWs, 3000);
        }
    });

    if (!patched) {
        before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ level, message }));
            }
        });
        patched = true;
    }
}

export function stopDebugWs() {
    if (!socket) return;
    socket?.close();
    socket = null;
}

import { settings } from "../../Aliucord";
import { Logger } from "../Logger";
import { makeAsyncEval } from "../misc";
import { before, Unpatch } from "../patcher";

const logger = new Logger("DebugWS");
let socket: WebSocket | null = null;
let unpatch: Unpatch | null = null;

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

    if (!unpatch) {
        unpatch = before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ level, message }));
            }
        });
    }
}

export function stopDebugWs() {
    // Unpatch the logger hook if patched
    unpatch?.();
    // Close the socket if open
    if (!socket) return;
    socket?.close();
    socket = null;
}

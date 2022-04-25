import { Logger } from "../Logger";
import { makeAsyncEval } from "../misc";
import { before } from "../patcher";

let ws: WebSocket;
export function startDebugWs() {
    if (ws) return;
    ws = new WebSocket("ws://localhost:3000");

    const logger = new Logger("DebugWS");
    logger.info("Connecting to debug ws");

    ws.addEventListener("open", () => logger.info("Connected with debug websocket"));
    ws.addEventListener("error", e => logger.error((e as ErrorEvent).message));
    ws.addEventListener("message", async message => {
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

    before(globalThis, "nativeLoggingHook", (_, message: string, level: number) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ level, message }));
        }
    });
}

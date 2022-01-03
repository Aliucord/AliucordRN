declare const nativeLoggingHook: (message: string, level: number) => void;

export default function setUpDebugWS() {
    console.log("Connecting to debug ws");
    const socket = new WebSocket("ws://localhost:9090");

    socket.addEventListener("open", () => console.log("Connected with debug websocket"));

    socket.addEventListener("message", message => {
        try {
            console.log(eval(message.data));
        } catch (e) {
            console.error(e);
        }
    });

    const _log = nativeLoggingHook;
    globalThis.nativeLoggingHook = (message: string, level: number) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ level, message }));
        return _log(message, level);
    }
}

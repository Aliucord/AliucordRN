declare module "react-devtools-core" {
    type ConnectionOptions = {
        host?: string,
        nativeStyleEditorValidAttributes?: string[],
        port?: number,
        useHttps?: boolean,
        resolveRNStyle?: (key: number) => Record<string, unknown>,
        retryConnectionDelay?: number,
        isAppActive?: () => boolean,
        websocket?: WebSocket;
    };

    export const connectToDevTools: (options: ConnectionOptions) => void;

    const exports: {
        connectToDevTools: (options: ConnectionOptions) => void;
    };
    export default exports;
}

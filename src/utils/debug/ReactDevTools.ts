import reactDevTools from "react-devtools-core";
import { getModule } from "../../metro";
import { Logger } from "../Logger";


let ws: WebSocket;
// Based on https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Core/setUpReactDevTools.js
export function startReactDevTools() {
    if (ws) return;
    ws = new WebSocket("ws://localhost:8097");

    const { AppState } = getModule(m => m.AppState);
    const isAppActive = () => AppState.currentState !== "background";
    const viewConfig = getModule(m => m.uiViewClassName == "RCTView");
    const { flattenStyle } = getModule(m => m.flattenStyle);

    const logger = new Logger("ReactDevTools");
    logger.info("Connecting to devtools");

    ws.addEventListener("error", e => {
        logger.warn("Connection error: " + (e as ErrorEvent).message);
    });

    reactDevTools.connectToDevTools({
        isAppActive,
        resolveRNStyle: flattenStyle,
        nativeStyleEditorValidAttributes: Object.keys(
            viewConfig.validAttributes.style,
        ),
        websocket: ws
    });
}

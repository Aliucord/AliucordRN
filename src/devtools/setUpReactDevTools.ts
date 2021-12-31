// Based on https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Core/setUpReactDevTools.js

import { getModule } from "../metro";
import reactDevTools from "react-devtools-core";

export default function setUpReactDevTools() {
    const { AppState } = getModule(m => m.AppState);

    const isAppActive = () => AppState.currentState !== "background";

    const ws = new (globalThis.WebSocket as any)("ws://localhost:8097");
    ws.addEventListener("close", function (event) {
        console.log("Devtools connection closed: " + event.message);
    });

    const viewConfig = getModule(m => m.uiViewClassName == "RCTView");
    const { flattenStyle } = getModule(m => m.flattenStyle);

    console.log("Connecting to devtools");
    reactDevTools.connectToDevTools({
        isAppActive,
        resolveRNStyle: flattenStyle,
        nativeStyleEditorValidAttributes: Object.keys(
            viewConfig.validAttributes.style,
        ),
        websocket: ws
    });
}
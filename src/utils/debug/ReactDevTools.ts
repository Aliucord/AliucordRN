import { connectToDevTools, installHook } from "@aliucord/react-devtools-core";
import { getModule } from "../../metro";
import { Logger } from "../Logger";

const logger = new Logger("ReactDevTools");

// Based on https://github.com/facebook/react-native/blob/v0.63.4/Libraries/Core/setUpReactDevTools.js

let socket: WebSocket;

function fixHook() {
    const oldHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (oldHook.injected) {
        const hook = installHook({});

        for (const injected of oldHook.injected) {
            hook.inject(injected);
        }
        delete oldHook.injected;

        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = Object.assign(oldHook, hook);
    }
}

export function startReactDevTools() {
    try {
        if (socket) throw "no";
        socket = new WebSocket("ws://localhost:8097");

        fixHook();

        const { AppState } = getModule(m => m.AppState);

        const isAppActive = () => AppState.currentState !== "background";

        socket.addEventListener("error", e =>
            logger.warn("Connection error: " + (e as ErrorEvent).message)
        );

        const viewConfig = getModule(m => m.uiViewClassName == "RCTView");
        const { flattenStyle } = getModule(m => m.flattenStyle);

        logger.info("Connecting to devtools");
        connectToDevTools({
            isAppActive,
            resolveRNStyle: flattenStyle,
            nativeStyleEditorValidAttributes: Object.keys(
                viewConfig.validAttributes.style,
            ),
            websocket: socket
        });
    } catch (err: any) {
        window.Aliucord.errors["ReactDevTools"] = err?.stack ?? err;
        logger.error(err);
    }
}

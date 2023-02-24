import { NativeEventSubscription } from "react-native";
import { logger } from "../Aliucord";
import { DiscordNavigator, ReactNative } from "../metro";
import { before } from "../utils/patcher";

/**
 * Anything that was pushed from Navigation.push() will be popped when the back button is pressed
 * This is a workaround so that page navigation works properly.
 * 
 * Navigator with 'goBackOnBackPress' prop will be patched to add a back button listener
 * that will call navgation.goBack() when the back button is pressed instead of the default behavior.
 */
export default function patchNavigator() {
    try {
        // There will be only one screen at a time, so we only need one subscription at a time
        let backSubscription: NativeEventSubscription;

        before(DiscordNavigator, "default", ({ args: [props] }) => {
            if (!props.goBackOnBackPress) return;

            const patchBackPress = ({ navigation }) => {
                backSubscription?.remove();

                if (navigation?.isFocused() && navigation.canGoBack()) {
                    const { BackHandler } = ReactNative;

                    backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
                        try {
                            navigation.goBack();
                        } finally {
                            // unsubscribe no matter what
                            backSubscription.remove();
                        }
                        return true;
                    });
                }
            };

            // Add back press event every page focus
            const orig = props.onWillFocus;
            props.onWillFocus = (...args) => {
                patchBackPress(args[0]);

                props.onWillFocus = orig;
                props.onWillFocus?.(...args);
            };
        });
    } catch (err) {
        window.Aliucord.errors["Navigator"] = "Failed to patch navigator\n" + err;
        logger.error("Failed to patch navigator", err);
    }
}

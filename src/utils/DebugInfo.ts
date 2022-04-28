import { ReactNative } from "../metro";

const DebugInfo = {
    get discordVersion(): string {
        try {
            return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
        } catch (ex) {
            return "unknown";
        }
    },

    get system(): string {
        try {
            return `${ReactNative.Platform.OS} ${ReactNative.Platform.constants.Release} (SDK v${ReactNative.Platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${ReactNative.Platform.constants.uiMode}`;
        } catch (ex) {
            return "unknown";
        }
    },

    get reactNativeVersion(): string {
        try {
            const ver = ReactNative.Platform.constants.reactNativeVersion;
            return `${ver.major || 0}.${ver.minor || 0}.${ver.patch || 0}`;
        } catch (ex) {
            return "unknown";
        }
    },

    get hermesVersion(): string {
        try {
            if (window.HermesInternal === undefined) return "N/A";
            const runtimeProps = window.HermesInternal.getRuntimeProperties();
            return `${runtimeProps["OSS Release Version"]} ${runtimeProps["Build"]} (v${runtimeProps["Bytecode Version"]})`;
        } catch (ex) {
            return "unknown";
        }
    }
};

export default DebugInfo;

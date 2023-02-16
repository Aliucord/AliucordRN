import type { PlatformAndroidStatic } from "react-native";
import { React, ReactNative } from "../../metro";

export const DebugInfo = {
    get discordVersion(): string {
        try {
            return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
        } catch {
            return "unknown";
        }
    },

    get discordBuild(): string {
        try {
            return `${ReactNative.NativeModules.InfoDictionaryManager.Build}`
        } catch {
            return "unknown"
        }
    },

    get system(): string {
        try {
            const platform = ReactNative.Platform as PlatformAndroidStatic;
            return `${platform.OS} ${platform.constants.Release} (SDK v${platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${platform.constants.uiMode}`;
        } catch {
            return "unknown";
        }
    },

    get reactVersion(): string {
        try {
            const native = ReactNative.Platform.constants.reactNativeVersion;
            return `${React.version}, Native: ${native.major || 0}.${native.minor || 0}.${native.patch || 0}`;
        } catch {
            return "unknown";
        }
    },

    get hermesVersion(): string {
        try {
            if (HermesInternal === undefined) return "N/A";
            const runtimeProps = (HermesInternal as any).getRuntimeProperties();
            return `${runtimeProps["OSS Release Version"]} ${runtimeProps["Build"]} (v${runtimeProps["Bytecode Version"]})`;
        } catch {
            return "unknown";
        }
    }
};

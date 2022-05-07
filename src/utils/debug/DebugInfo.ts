import { PlatformAndroidStatic } from "react-native";
import { ReactNative } from "../../metro";

export class DebugInfo {
    static get discordVersion(): string {
        try {
            return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
        } catch (ex) {
            return "unknown";
        }
    }

    static get system(): string {
        try {
            const platform = ReactNative.Platform as PlatformAndroidStatic;
            return `${platform.OS} ${platform.constants.Release} (SDK v${platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${platform.constants.uiMode}`;
        } catch (ex) {
            return "unknown";
        }
    }

    static get reactNativeVersion(): string {
        try {
            const ver = ReactNative.Platform.constants.reactNativeVersion;
            return `${ver.major || 0}.${ver.minor || 0}.${ver.patch || 0}`;
        } catch (ex) {
            return "unknown";
        }
    }

    static get hermesVersion(): string {
        try {
            if (HermesInternal === undefined) return "N/A";
            const runtimeProps = (HermesInternal as any).getRuntimeProperties();
            return `${runtimeProps['OSS Release Version']} ${runtimeProps['Build']} (v${runtimeProps['Bytecode Version']})`;
        } catch (ex) {
            return "unknown";
        }
    }
}

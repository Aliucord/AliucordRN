import { ReactNative } from "../../metro";

export class DebugInfo {
    static getDiscordVersion(): string {
        return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
    }

    static getSystem(): string {
        return `${ReactNative.Platform.OS} ${ReactNative.Platform.constants.Release} (SDK v${ReactNative.Platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${ReactNative.Platform.constants.uiMode}`
    }

    static getReactNativeVersion(): string {
        const ver = ReactNative.Platform.constants.reactNativeVersion;
        return `${ver.major || 0}.${ver.minor || 0}.${ver.patch || 0}`;
    }
}

export default DebugInfo

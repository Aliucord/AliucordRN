import { ReactNative } from "../../metro";

const capitalize = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join("");

export class DebugInfo {
    static getDiscordVersion(): string {
        try {
            return `${ReactNative.NativeModules.InfoDictionaryManager.Version} (${ReactNative.NativeModules.InfoDictionaryManager.ReleaseChannel})`;
        } catch (ex) {
            return "unknown";
        }
    }

    static getSystem(): string {
        try {
            return `${capitalize(ReactNative.Platform.OS)} ${ReactNative.Platform.constants.Release} (SDK v${ReactNative.Platform.Version}) ${ReactNative.NativeModules.DCDDeviceManager.device} ${ReactNative.Platform.constants.uiMode}`
        } catch (ex) {
            return "unknown";
        } 
    }

    static getReactNativeVersion(): string {
        try {
            const ver = ReactNative.Platform.constants.reactNativeVersion;
            return `${ver.major || 0}.${ver.minor || 0}.${ver.patch || 0}`;
        } catch (ex) {
            return "unknown";
        }
    }

    static getHermesVersion(): string {
        try {
            if (window.HermesInternal === undefined) return "N/A";
            const runtimeProps = window.HermesInternal.getRuntimeProperties()
            return `${runtimeProps['OSS Release Version']} ${runtimeProps['Build']} (v${runtimeProps['Bytecode Version']})`
        } catch (ex) {
            return "unknown";
        }
    }
}

export default DebugInfo

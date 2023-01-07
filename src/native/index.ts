import { AliucordNative } from "./AliucordNative";

/**
 * Get a list of all native modules
 * @returns Map<ModuleName, MethodList>
 */
export const listNativeModules = AliucordNative.listNativeModules;

/**
 * Restarts the app
 */
export const restartApp = AliucordNative.restartApp;

export * as fs from "./fs";
export * as permissions from "./permissions";


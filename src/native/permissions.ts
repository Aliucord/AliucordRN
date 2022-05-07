import { AliucordNative } from "./AliucordNative";

/**
 * Used to check if Aliucord has storage permissions
 */
export const checkPermissions = AliucordNative.checkPermissions;

/**
 * Used to request storage permissions
 */
export const requestPermissions = AliucordNative.requestPermissions;

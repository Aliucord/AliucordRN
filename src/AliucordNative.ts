import { PluginManifest } from "./entities/types";
// import { Logger } from "./utils/Logger";

/**
 * FilePath. Must be absolute
 */
export type Path = string;

const AliucordNative = window.nativeModuleProxy.AliucordNative;

// creating logger here makes Aliucord not load??
// const logger = new Logger("AliucordNative");

/**
 * Create a directory
 * @param path Path to directory
 * @param recursive Whether to recursively create parent directories if they do not exist
 * @returns true if mkdir succeeded or file exists. false otherwise
 */
export async function mkdir(path: Path, recursive = false): Promise<boolean> {
    try {
        return AliucordNative.mkdir(path, recursive);
    } catch (err) {
        // logger.error(`mkdir failed.\npath: ${path}, recursive: ${recursive}`, err);
        return false;
    }
}

/**
 * Check whether a file exists
 * @param path File path 
 * @returns boolean
 */
export const existsFile: (path: Path) => Promise<boolean> = AliucordNative.existsFile;

/**
 * Delete a file
 * @param path File path 
 * @returns Whether the file was successfully deleted
 */
export const deleteFile: (path: Path) => Promise<boolean> = AliucordNative.deleteFile;

/**
 * Read a file
 * @param path Path to file
 * @param encoding Encoding. Must be one of utf-8 or base64
 * @returns content in the specified encoding
 */
export async function readFile(path: Path, encoding: "base64" | "utf-8" = "utf-8"): Promise<string> {
    return AliucordNative.readFile(path, encoding);
}

/**
 * Write a file
 * @param path Path to file
 * @param content Content. Must be a string, pass base64 to write binary
 * @param encoding Encoding of content. Must be one of utf-8 or base64
 */
export async function writeFile(path: Path, content: string, encoding: "base64" | "utf-8" = "utf-8"): Promise<boolean> {
    return AliucordNative.writeFile(path, content, encoding);
}

/**
 * Retrieve a plugin's manifest
 * @param plugin Plugin name
 * @returns PluginManifest or null if no manifest found
 */
export async function getManifest(plugin: string): Promise<PluginManifest | null> {
    try {
        const data = await AliucordNative.getManifest(plugin);
        return JSON.parse(data);
    } catch (err) {
        // logger.error("Error while obtaining manifest of " + plugin, err);
        return null;
    }
}

/**
 * Get a list of all native modules
 * @returns Map<ModuleName, MethodList>
 */
export const listNativeModules: () => Promise<Record<string, string[]>> = AliucordNative.listNativeModules;

/**
 * Used to check if Aliucord has storage permissions
 */
export const checkPermissions: () => Promise<boolean> = AliucordNative.checkPermissions;

/**
 * Used to request storage permissions
 */
export const requestPermissions: () => Promise<boolean> = AliucordNative.requestPermissions;

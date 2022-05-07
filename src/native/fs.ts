import { AliucordNative } from "./AliucordNative";

/**
 * Reads a directory
 * @param path Path to directory
 */
export const readdir = AliuFS.readdir;

/**
 * Create a directory
 * @param path Path to directory
 */
export const mkdir = AliuFS.mkdir;

/**
 * Check whether a file exists
 * @param path File path 
 * @returns boolean
 */
export const exists = AliuFS.exists;

/**
 * Delete a file
 * @param path File path 
 */
export const deleteFile = AliuFS.remove;

/**
 * Read a file
 * @param path Path to file
 * @param encoding Encoding
 * @returns content in the specified encoding
 */
export function readFile(path: string, encoding?: "text"): string;
export function readFile(path: string, encoding?: "binary"): ArrayBuffer;
export function readFile(path: string, encoding: "text" | "binary" = "text"): string | ArrayBuffer {
    return AliuFS.readFile(path, encoding);
}

/**
 * Write a file
 * @param path Path to file
 * @param content Content
 */
export const writeFile = AliuFS.writeFile;

/**
 * Downloads a file
 */
export const download = AliucordNative.download;

export const externalStorageDirectory = AliucordNative.externalStorageDirectory;
export const codeCacheDirector = AliucordNative.codeCacheDirectory;

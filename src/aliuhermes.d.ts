declare global {
    const AliuHermes: {
        run: (path: string, buffer?: ArrayBuffer) => any;
        // eslint-disable-next-line @typescript-eslint/ban-types
        findStrings: (fun: Function) => string[];
        unfreeze: (obj: T) => T;
    };

    const AliuFS: {
        readdir: (path: string) => { name: string, type: "file" | "directory"; }[];
        mkdir: (path: string) => void;
        exists: (path: string) => boolean;
        remove: (path: string) => void;
        readFile: (path: string, encoding: "text" | "binary") => string | ArrayBuffer;
        writeFile: (path: string, content: string | ArrayBuffer) => void;
    };

    class ZipFile {
        constructor(path: string, level: number, mode: "w" | "r" | "a" | "d");

        openEntry(name: string);
        readEntry(encoding: "text"): string;
        readEntry(encoding: "binary"): ArrayBuffer;
        closeEntry();

        close();
    }
}

export { };

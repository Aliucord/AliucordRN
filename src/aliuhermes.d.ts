declare global {
    const AliuHermes: {
        run: (path: string) => any;
        // eslint-disable-next-line @typescript-eslint/ban-types
        findStrings: (fun: Function) => string[];
    };

    const AliuFS: {
        readdir: (path: string) => { name: string, type: "file" | "directory"; }[];
        mkdir: (path: string) => void;
        exists: (path: string) => boolean;
        remove: (path: string) => void;
        readFile: (path: string, encoding: "text" | "binary") => string | ArrayBuffer;
        writeFile: (path: string, content: string | ArrayBuffer) => void;
    };
}

export { };

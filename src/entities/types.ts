export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    authors: PluginAuthor;
}[];

export interface PluginAuthor {
    map(arg0: (a: any, i: any) => JSX.Element): import("react").ReactNode;
    length: number;
    id: string;
    username: string;
}[];

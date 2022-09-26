export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    authors: PluginAuthor[];
}

export interface PluginAuthor {
    length: number;
    id: string;
    username: string;
}

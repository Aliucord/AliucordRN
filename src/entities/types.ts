export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    authors: PluginAuthor[];
}

export interface PluginAuthor {
    id: string;
    name: string;
}

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

export type Theme = {
    name: string;
    description: string;
    version: string;
    theme_color_map: string[];
    colors: string[];
}

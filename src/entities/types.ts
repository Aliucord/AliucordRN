export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    authors: Author[];
}

export interface Author {
    id: string;
    name: string;
}

export type Theme = {
    name: string;
    authors: Author[];
    description: string;
    version: string;
    theme_color_map: string[];
    colors: string[];
};

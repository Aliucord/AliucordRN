export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    repo: string;
    changelog: { [key: string]: string }[];
    authors?: Author[];
}

export interface Author {
    id?: string;
    name: string;
}

export type Theme = {
    name: string;
    authors?: Author[];
    description: string;
    version: string;
    updater_url?: string;
    theme_color_map: string[];
    colors: string[];
    unsafe_colors: string[];
    // Enmity colors object
    colours?: string[];
};

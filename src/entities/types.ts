export interface PluginManifest {
    name: string;
    description: string;
    version: string;
    repo: string;
    changelog: Record<string, string> | null;
    authors?: Author[];
}

export interface Author {
    id?: string;
    name: string;
}

export type Theme = {
    name: string;
    authors?: Author[];
    description?: string;
    version?: string;
    updater_url?: string;
    theme_color_map?: Record<string, [string, string, string?]>;
    colors?: Record<string, string>;
    unsafe_colors?: Record<string, string>;
    // Enmity colors object
    colours?: Record<string, string>;
};

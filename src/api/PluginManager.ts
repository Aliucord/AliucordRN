import Plugin from "../entities/Plugin";
import { Logger } from "../utils/Logger";
import { Settings } from "./Settings";

const logger = new Logger("PluginManager");

export class PluginManager {
    public static readonly plugins = {} as Record<string, Plugin>;

    public static isEnabled(plugin: string) {
        return window.Aliucord.settings.get("plugins", {})[plugin] === true;
    }

    public static enable(plugin: string) {
        const plugins = window.Aliucord.settings.get("plugins", {});
        plugins[plugin] = true;
        window.Aliucord.settings.set("plugins", plugins);
    }

    public static disable(plugin: string) {
        const plugins = window.Aliucord.settings.get("plugins", {});
        plugins[plugin] = false;
        window.Aliucord.settings.set("plugins", plugins);
    }

    private static _register(plugin: typeof Plugin) {
        const { name } = plugin;
        if (name in this.plugins) throw new Error(`Plugin ${name} already registered`);

        try {
            logger.info(`Loading Plugin ${name}...`);
            Settings.make(name).then(settings => {
                const inst = this.plugins[name] = new plugin(settings);
                inst.start();
            });
        } catch (err) {
            logger.error(`Failed to load Plugin ${name}\n`, err);
        }
    }
}

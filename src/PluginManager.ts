import { Settings } from "./api/SettingsAPI";
import Plugin from "./entities/Plugin";
import { Logger } from "./utils/Logger";

const logger = new Logger("PluginManager");

// TODO
class PluginManager {
    public readonly plugins = {} as Record<string, Plugin>;

    private _register(plugin: typeof Plugin) {
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

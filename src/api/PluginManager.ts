import { Aliucord } from "..";
import { Plugin } from "../entities/Plugin";
import { readdir } from "../native/fs";
import { PLUGINS_DIRECTORY } from "../utils/constants";
import { Logger } from "../utils/Logger";
import { Settings } from "./Settings";

export class PluginManager {
    private logger = new Logger("PluginManager");
    public readonly plugins = {} as Record<string, Plugin>;

    public constructor(private aliucord: Aliucord) {
    }

    public isEnabled(plugin: string) {
        return this.aliucord.settings.get("plugins", {})[plugin] === true;
    }

    public enable(plugin: string) {
        const plugins = this.aliucord.settings.get("plugins", {});
        plugins[plugin] = true;
        this.aliucord.settings.set("plugins", plugins);
        this.logger.info(`Enabled plugin: ${plugin}`);
    }

    public disable(plugin: string) {
        const plugins = this.aliucord.settings.get("plugins", {});
        plugins[plugin] = false;
        this.aliucord.settings.set("plugins", plugins);
        this.logger.info(`Disabled plugin: ${plugin}`);
    }

    public load() {
        // TODO load from zips
        for (const file of readdir(PLUGINS_DIRECTORY)) {
            if (file.name.endsWith(".bundle")) {
                this.logger.info("Running plugin bundle: " + file.name);
                const pluginClass = AliuHermes.run(PLUGINS_DIRECTORY + file.name) as typeof Plugin;

                const { name } = pluginClass;
                if (name in this.plugins) throw new Error(`Plugin ${name} already registered`);

                try {
                    this.logger.info(`Loading Plugin: ${name}...`);
                    Settings.make(name).then(settings => {
                        const plugin = this.plugins[name] = new pluginClass(settings);
                        plugin.start();
                        this.logger.info(`Plugin ${name} has been loaded.`);
                    });
                } catch (err) {
                    this.logger.error(`Plugin failed to load: ${name}\n`, err);
                }
            }
        }
    }
}

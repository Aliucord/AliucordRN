import { Commands, Patcher, Settings } from "../api";
import { Logger } from "../utils/Logger";
import { PluginManifest } from "./types";

/**
 * Plugin class
 * You may pass a Settings Schema to have calls to
 * this.settings.get and this.settings.set validated and typed strongly
 */
export class Plugin<SettingsSchema = any> {
    private pluginBuffer?: ArrayBuffer;
    public readonly commands = new Commands(this.name);
    public readonly logger = new Logger(this.name);
    public readonly patcher = new Patcher(this.name);
    public readonly settings = new Settings<SettingsSchema>(this.name);
    public errors = {} as Record<string, string>;
    public enabled = {} as boolean;
    public localPath?: string;

    public constructor(public readonly manifest: PluginManifest) { }

    public get name() {
        return this.constructor.name;
    }

    /**
     * The start method is called when your plugin is started
     */
    public start() {
        // nop
    }

    /**
     * The stop method is called when your plugin is stopped.
     * By default, this unregisters all commands and patches, so unless
     * you need to do more cleanup than that, there is no need to overwrite this.
     */
    public stop() {
        this.commands.unregisterAll();
        this.patcher.unpatchAll();
    }

    /**
     * This fetches the settings page that the plugin has defined.
     * 
     */
    public getSettingsPage?(props: any[]): React.ReactElement;
}

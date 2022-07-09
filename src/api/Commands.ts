import { SnowflakeUtils } from "../metro";

export interface CommandSection {
    id: string;
    name: string;
    icon?: string;
}

export interface ApplicationCommand {
    description: string;
    name: string;
    options: ApplicationCommandOption[];
    execute: (args: any[], ctx: CommandContext) => CommandResult | void | Promise<CommandResult> | Promise<void>;

    // added automatically in register
    id?: string;
    applicationId?: string;
    displayName?: string;
    displayDescription?: string;
    inputType?: ApplicationCommandInputType;
    type?: ApplicationCommandType;
}

export interface AliucordCommand extends ApplicationCommand {
    __plugin?: string;
}

export enum ApplicationCommandInputType {
    BUILT_IN,
    BUILT_IN_TEXT,
    BUILT_IN_INTEGRATION,
    BOT,
    PLACEHOLDER
}

export interface ApplicationCommandOption {
    name: string;
    description: string;
    required?: boolean;
    type: ApplicationCommandOptionType;

    // added automatically in register
    displayName?: string;
    displayDescription?: string;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER6,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT
}

export enum ApplicationCommandType {
    CHAT = 1,
    USER,
    MESSAGE
}

export interface CommandContext {
    channel: any;
    guild: any;
}

export interface CommandResult {
    content: string;
    tts?: boolean;
}

export class Commands {
    private static _idIncrementNum = Date.now();

    static generateId = () => `-${SnowflakeUtils.fromTimestamp(Commands._idIncrementNum++)}`;

    public static _aliucordSection: CommandSection = {
        id: Commands.generateId(),
        name: "Aliucord"
    };

    public static _commands: AliucordCommand[] = [];

    public constructor(private plugin: string) { }

    registerCommand(command: AliucordCommand) {
        command.id = Commands.generateId();
        command.applicationId = Commands._aliucordSection.id;
        command.displayName = command.name;
        command.displayDescription = command.description;
        command.inputType = ApplicationCommandInputType.BUILT_IN;
        command.type = ApplicationCommandType.CHAT;
        command.__plugin = this.plugin;

        for (const option of command.options) {
            option.displayName = option.name;
            option.displayDescription = option.description;
        }

        Commands._commands.push(command);
    }

    unregisterAll() {
        Commands._commands = Commands._commands.filter(c => c.__plugin !== this.plugin);
    }
}

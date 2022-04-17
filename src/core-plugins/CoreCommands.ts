import { ApplicationCommandOptionType } from "../api/Commands";
import Plugin from "../entities/Plugin";
import { getByProps, i18n } from "../metro";

export default class CoreCommands extends Plugin {
    start() {
        const ClydeUtils = getByProps("sendBotMessage").default;
        this.commands.registerCommand({
            name: "echo",
            description: "Creates Clyde message",
            options: [
                {
                    name: "message",
                    description: i18n.Messages.COMMAND_SHRUG_MESSAGE_DESCRIPTION,
                    required: true,
                    type: ApplicationCommandOptionType.STRING
                }
            ],
            execute: (args, ctx) => {
                ClydeUtils.sendBotMessage(ctx.channel.id, args[0].value);
            }
        });
    }
}

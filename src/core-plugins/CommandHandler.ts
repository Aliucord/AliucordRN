import { ApplicationCommand, ApplicationCommandType, Commands, CommandSection } from "../api/Commands";
import { Plugin } from "../entities/Plugin";
import { getByProps } from "../metro";
import { after } from "../utils/patcher";

export default class CommandHandler extends Plugin {
    start() {
        const commands = getByProps("getBuiltInCommands");
        after<any, ApplicationCommand[], any>(commands, "getBuiltInCommands", context => {
            if (context.args[0] != ApplicationCommandType.CHAT) return;
            context.result = [...context.result, ...Commands._commands];
        });

        const discovery = getByProps("useApplicationCommandsDiscoveryState");
        after(discovery, "useApplicationCommandsDiscoveryState", context => {
            const res = context.result as any;
            if (!res.discoverySections.find((s: any) => s.key === Commands._aliucordSection.id) && Commands._commands.length) {
                res.discoveryCommands.push(...Commands._commands);
                res.commands.push(...Commands._commands.filter(
                    command => !res.commands.some((cmd: ApplicationCommand) => cmd.name === command.name))
                );

                res.discoverySections.push({
                    data: Commands._commands,
                    key: Commands._aliucordSection.id,
                    section: Commands._aliucordSection
                });

                const offsets = res.sectionsOffset;
                offsets.push(offsets[offsets.length - 1] + commands.BUILT_IN_COMMANDS.length - 1);
            }

            if (!res.applicationCommandSections.find((s: CommandSection) => s.id === Commands._aliucordSection.id) && Commands._commands.length) {
                res.applicationCommandSections.push(Commands._aliucordSection);
            }
        });
    }
}

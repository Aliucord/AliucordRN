import { ApplicationCommand, ApplicationCommandType, Commands } from "../api/Commands";
import { Plugin } from "../entities/Plugin";
import { getByProps } from "../metro";
import { after } from "../utils/patcher";

export default class CommandHandler extends Plugin {
    start() {
        const commands = getByProps("getBuiltInCommands");
        commands.BUILT_IN_SECTIONS["aliucord"] = Commands._aliucordSection;
        after<any, ApplicationCommand[], any>(commands, "getBuiltInCommands", context => {
            if (context.args[0] != ApplicationCommandType.CHAT) return;
            context.result = [...context.result, ...Commands._commands];
        });

        const assets = getByProps("getApplicationIconURL");
        after(assets, "getApplicationIconURL", context => {
            const [props] = context.args;
            if (props.id === Commands._aliucordSection.id)
                context.result = Commands._aliucordSection.icon;
        });
        
    }
}

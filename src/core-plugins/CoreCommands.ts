import { sha } from "aliucord-version";
import { ApplicationCommandOptionType } from "../api/Commands";
import { disabledPlugins, plugins } from "../api/PluginManager";
import { Plugin } from "../entities/Plugin";
import { getByProps, i18n, MessageActions } from "../metro";
import { DebugInfo } from "../utils/debug/DebugInfo";
import { makeAsyncEval } from "../utils/misc";

export default class CoreCommands extends Plugin {
    start() {
        const ClydeUtils = getByProps("sendBotMessage");
        this.commands.registerCommand({
            name: "echo",
            description: "Creates a Clyde message",
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

        this.commands.registerCommand({
            name: "plugins",
            description: "Lists all installed Aliucord plugins",
            options: [],
            execute: (args, ctx) => {
                const enabledplugins = Object.values(plugins).map(p => p.manifest.name).filter(name => disabledPlugins[name] === undefined);
                const disabledplugins = Object.values(disabledPlugins).map(p => p.name);

                const message = `
                **Total plugins**: **${enabledplugins.length + disabledplugins.length || 0}**
                
                **Enabled plugins**: **${enabledplugins.length || 0}**
                > ${enabledplugins.join(", ") || "None."}
                
                **Disabled plugins**: **${disabledplugins.length || 0}**
                > ${disabledplugins.join(", ") || "None."}`;

                ClydeUtils.sendBotMessage(ctx.channel.id, message.replaceAll("    ", ""));
            }
        });

        this.commands.registerCommand({
            name: "eval",
            description: "Evaluate JavaScript",
            options: [
                {
                    name: "code",
                    description: "Code to eval. Async functions are not supported. Await is, however you must specify a return explicitly",
                    required: true,
                    type: ApplicationCommandOptionType.STRING
                }
            ],
            execute: async (args, ctx) => {
                try {
                    const code = args[0].value as string;

                    let result;
                    if (code.includes("await")) {
                        result = await (0, eval)(makeAsyncEval(code));
                    } else {
                        result = (0, eval)(code);
                    }

                    ClydeUtils.sendBotMessage(ctx.channel.id, this.codeblock(String(result)));
                } catch (err: any) {
                    ClydeUtils.sendBotMessage(ctx.channel.id, this.codeblock(err?.stack ?? err?.message ?? String(err)));
                }
            }
        });

        this.commands.registerCommand({
            name: "debug",
            description: "Posts debug info",
            options: [],
            execute: async (args, ctx) => {
                MessageActions.sendMessage(ctx.channel.id, {
                    content: `**Debug Info:**
                        > Discord: ${DebugInfo.discordVersion}
                        > Aliucord: ${sha} (${Object.keys(plugins).length + Object.keys(disabledPlugins).length} plugins)
                        > System: ${DebugInfo.system}
                        > React: ${DebugInfo.reactVersion}
                        > Hermes: ${DebugInfo.hermesVersion}
                    `.replace(/^\s+/gm, "")
                });
            }
        });
    }

    private codeblock(code: string) {
        const ZWSP = "​";
        return "```js\n" + code.replace(/`/g, "`" + ZWSP) + "```";
    }
}

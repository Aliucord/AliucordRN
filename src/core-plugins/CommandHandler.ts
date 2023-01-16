import { ApplicationCommand, ApplicationCommandType, Commands } from "../api/Commands";
import { Plugin } from "../entities";
import { getByProps, SearchStore } from "../metro";
import { after } from "../utils/patcher";

export default class CommandHandler extends Plugin {
    start() {
        const sections = getByProps("getApplicationSections");
        after(sections, "getApplicationSections", (ctx) => {
            if (ctx.result.some((section) => section.id === Commands._aliucordSection.id)) return;
            ctx.result = [Commands._aliucordSection, ...ctx.result];
        });

        const commands = getByProps("getBuiltInCommands");
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

        after(SearchStore.default, "getQueryCommands", (ctx) => {
            const [, , query] = ctx.args;
            if (!query || query.startsWith("/")) return;
            ctx.result ??= [];

            for (const command of Commands._commands) {
                if (!~command.name?.indexOf(query) || ctx.result.some(e => e.__plugin && e.id === command.id)) {
                    continue;
                }

                try {
                    ctx.result.unshift(command);
                } catch {
                    // Discord calls Object.preventExtensions on the result when switching channels
                    // Therefore, re-making the result array is required.
                    ctx.result = [...ctx.result, command];
                }
            }
        });

        after(SearchStore, "useDiscoveryState", (ctx) => {
            const [, type] = ctx.args;
            if (type !== 1) return;

            if (!ctx.result.sectionDescriptors?.find?.(s => s.id === Commands._aliucordSection.id)) {
                ctx.result.sectionDescriptors ??= [];
                ctx.result.sectionDescriptors.push(Commands._aliucordSection);
            }

            if ((!ctx.result.filteredSectionId || ctx.result.filteredSectionId === Commands._aliucordSection.id) && !ctx.result.activeSections.find(s => s.id === Commands._aliucordSection.id)) {
                ctx.result.activeSections.push(Commands._aliucordSection);
            }

            if (Commands._commands.some(c => !ctx.result.commands?.find?.(r => r.id === c.id))) {
                ctx.result.commands ??= [];

                // De-duplicate commands
                const collection = [...ctx.result.commands, ...Commands._commands];
                ctx.result.commands = [...new Set(collection).values()];
            }

            if ((!ctx.result.filteredSectionId || ctx.result.filteredSectionId === Commands._aliucordSection.id) && !ctx.result.commandsByActiveSection.find(r => r.section.id === Commands._aliucordSection.id)) {
                ctx.result.commandsByActiveSection.push({
                    section: Commands._aliucordSection,
                    data: Commands._commands
                });
            }

            const active = ctx.result.commandsByActiveSection.find(r => r.section.id === Commands._aliucordSection.id);
            if ((!ctx.result.filteredSectionId || ctx.result.filteredSectionId === Commands._aliucordSection.id) && active && active.data.length === 0 && Commands._commands.length !== 0) {
                active.data = Commands._commands;
            }

            /*
             * Filter out duplicate built-in sections due to a bug that causes
             * the getApplicationSections path to add another built-in commands
             * section to the section rail
             */

            const builtIn = ctx.result.sectionDescriptors.filter(s => s.id === "-1");
            if (builtIn.length > 1) {
                ctx.result.sectionDescriptors = ctx.result.sectionDescriptors.filter(s => s.id !== "-1");
                ctx.result.sectionDescriptors.push(builtIn.find(r => r.id === "-1"));
            }
        });
    }
}

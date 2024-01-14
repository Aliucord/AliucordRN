import { ChannelStore, getByProps, MessageActions } from "../metro";

/**
 * Makes await work in eval.
 * @param code Code to awaitify
 * @returns Modified code (Do not look at it. Trust me, it is an abomination)
 */
export function makeAsyncEval(code: string) {
    return `
    var __async = (generator) => {
        return new Promise((resolve, reject) => {
            var fulfilled = (value) => {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            };

            var rejected = (value) => {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            };

            var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

            step((generator = generator()).next());
        });
    };

    __async(function*() {
        ${code.replace(/\bawait\b/g, "yield")}
    });
    `;
}

const Clyde = getByProps("createBotMessage");
const Avatars = getByProps("BOT_AVATARS");
export function sendBotMessage(channelID: string, content: (string | object), username?: string, avatarURL?: string): void {
    const channel = channelID ?? ChannelStore?.getChannelId?.();
    const msg = Clyde.createBotMessage({ channelId: channel, content: "" });
  
    msg.author.username = username ?? "Aliucord";
    msg.author.avatar = avatarURL ? username : "ALIUCORD";

    Avatars.BOT_AVATARS[msg.author.avatar] = avatarURL ?? "https://github.com/aliucord.png";

    if (typeof content === "string")
        msg.content = content;
    else
        Object.assign(msg, content);
  
    msg.embeds?.forEach(embed => {
        if (embed.type === undefined) embed.type = "rich";
    });

    MessageActions.receiveMessage(channel, msg);
}

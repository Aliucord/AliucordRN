import { Plugin } from "../entities";
import { getByName, React, ReactNative, Styles, Toasts } from "../metro";
import { after } from "../utils/patcher";

const { View, Image, Pressable } = ReactNative;

const url = "https://raw.githubusercontent.com/Aliucord/badges/main/";

const roles = {
    "dev": {
        "url": "https://cdn.discordapp.com/emojis/860165259117199401.webp",
        "text": "Aliucord Developer"
    },
    "donor": {
        "url": "https://cdn.discordapp.com/emojis/859801776232202280.webp",
        "text": "Aliucord Donor"
    },
    "contributor": {
        "url": "https://cdn.discordapp.com/emojis/886587553187246120.webp",
        "text": "Aliucord Contributor"
    }

};

export default class Badges extends Plugin {
    start() {
        const ProfileBadges = getByName("ProfileBadges");

        const styles = Styles.createThemedStyleSheet({
            container: {
                marginTop: -40,
                justifyContent: "flex-end"
            },
            img: {
                width: 24,
                height: 24,
                resizeMode: "contain"
            }
        });

        const cache = {};

        after(ProfileBadges, "default", (ctx, component) => {
            const user = ctx.args[0]?.user;
            if (typeof user === "undefined") return;

            if (typeof cache[user.id] !== "undefined") {
                const renderedBadges = cache[user.id]?.filter(it => it?.url && it?.text).map(badge => {
                    return <Pressable onPress={() => {
                        Toasts.open({
                            content: badge.text,
                            source: { uri: badge.url }
                        });
                    }}>
                        <Image source={{ uri: badge.url }} style={styles.img} />
                    </Pressable>;
                }) || [];

                ctx.result = [component, <View style={styles.container}>{renderedBadges}</View>];
                return;
            }


            fetch(`${url}/users/${user.id}.json`)
                .then(r => r.json())
                .then(badges => {
                    cache[user.id] = [...(badges.roles.map(it => roles[it]) || []), ...(badges.custom || [])];
                });
        });
    }
}

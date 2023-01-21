import { Plugin } from "../entities";
import { getByName, React, Styles, Toasts } from "../metro";
import { General } from "../ui/components";
import { after } from "../utils/patcher";

const { View, Image, TouchableOpacity } = General;

interface BadgeOwner {
    roles: string[];
    custom?: Badge[];
}

interface Badge {
    url: string;
    text: string;
}

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
        const ProfileBadges = getByName("ProfileBadges", { default: false });

        const styles = Styles.createThemedStyleSheet({
            container: {
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "flex-end",
            },
            img: {
                width: 24,
                height: 24,
                resizeMode: "contain",
                marginHorizontal: 4
            }
        });

        const cache: Record<string, Badge[]> = {};

        after(ProfileBadges, "default", (ctx) => {
            const [, forceUpdate] = React.useReducer(x => x = !x, false);

            const user = ctx.args[0]?.user;
            if (user === undefined) return;

            const badges = cache[user.id];
            if (badges === undefined) {
                fetch(`${url}/users/${user.id}.json`)
                    .then(r => r.json())
                    .then((badges: BadgeOwner) => {
                        cache[user.id] = [...badges.roles.map(it => roles[it]), ...(badges.custom ?? [])];
                        cache[user.id].length && forceUpdate();
                    });
                return;
            }

            const renderedBadgesView = (
                <View key="aliu-badges" style={styles.container}>
                    {badges.map(badge => (
                        <TouchableOpacity key={badge.url} onPress={() => {
                            Toasts.open({
                                content: badge.text,
                                source: { uri: badge.url }
                            });
                        }}>
                            <Image source={{ uri: badge.url }} style={styles.img} />
                        </TouchableOpacity>
                    ))}
                </View>
            );

            if (!ctx.result) return renderedBadgesView;

            ctx.result.props.children.push(renderedBadgesView);
            return;
        });
    }
}

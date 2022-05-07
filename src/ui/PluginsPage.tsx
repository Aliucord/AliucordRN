import { aliucord } from "..";
import { PluginManifest } from "../entities/types";
import { Constants, Forms, React, ReactNative, Styles } from "../metro";
import { getByProps } from "../metro/index";

const { View, Text, FlatList } = ReactNative;

// Dummy data for now lmao
const plugins: PluginManifest[] = [
    {
        name: "Test",
        description: "Test Plugin",
        version: "1.0.0",
        authors: [
            {
                username: "Pot of Avarice",
                id: "950095902922661988"
            },
            {
                username: "Discord",
                id: "643945264868098049"
            }
        ]
    }
];
for (let i = 1; i < 5; i++) {
    const copy = { ...plugins[i - 1] };
    copy.name += "a";
    copy.description += copy.description;
    plugins[i] = copy;
}

const styles = Styles.createThemedStyleSheet({
    list: {
        padding: 10,
    },
    card: {
        borderRadius: 5,
        margin: 10,
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_TERTIARY,
    },
    header: {
        flexDirection: "row"
    },
    bodyCard: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_SECONDARY,
    },
    bodyText: {
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        padding: 16,
    },
    text: {
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontSize: 16,
        lineHeight: 22
    },
    link: {
        marginLeft: 5,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        fontSize: 16,
        lineHeight: 22,
        color: Styles.ThemeColorMap.TEXT_LINK
    }
});

function PluginCard({ plugin }: { plugin: PluginManifest; }) {
    const [isEnabled, setIsEnabled] = React.useState(aliucord.pluginManager.isEnabled(plugin.name));

    return (
        <View style={styles.card}>
            <Forms.FormRow
                label={(
                    <View style={styles.header}>
                        <Text style={styles.text}>
                            {plugin.name} v{plugin.version} by
                        </Text>
                        {plugin.authors.map((a, i) => (
                            <Text
                                key={a.id}
                                style={styles.link}
                                onPress={() => getByProps("showUserProfile").showUserProfile({ userId: a.id })}
                            >
                                {a.username}{i !== plugin.authors.length - 1 && ","}
                            </Text>
                        ))}
                    </View>)}
                trailing={<Forms.FormSwitch value={isEnabled} onValueChange={v => {
                    if (v)
                        aliucord.pluginManager.enable(plugin.name);
                    else
                        aliucord.pluginManager.disable(plugin.name);

                    setIsEnabled(v);
                }} />}
            />
            <View style={styles.bodyCard}>
                <Forms.FormText style={styles.bodyText}>{plugin.description}</Forms.FormText>
            </View>
        </View>
    );
}

export default function PluginsPage() {
    return (
        <FlatList
            data={plugins}
            renderItem={({ item }) => <PluginCard
                key={item.name}
                plugin={item}
            />}
            keyExtractor={plugin => plugin.name}
            style={styles.list}
        />
    );
}

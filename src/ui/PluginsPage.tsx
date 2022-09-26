import { disablePlugin, enablePlugin, isPluginEnabled } from "../api/PluginManager";
import { PluginManifest } from "../entities/types";
import { Constants, Forms, React, ReactNative, Styles } from "../metro";
import { getByProps } from "../metro/index";
import { getAssetId } from "../utils/getAssetId";

const { View, Text, FlatList, Image } = ReactNative;

const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1,
        padding: 5
    },
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
    },
    noPlugins: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "50%"
    },
    noPluginsText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    }
});

function PluginCard({ plugin }: { plugin: PluginManifest; }) {
    const [isEnabled, setIsEnabled] = React.useState(isPluginEnabled(plugin.name));

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
                        enablePlugin(plugin.name);
                    else
                        disablePlugin(plugin.name);

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
    const plugins: PluginManifest[] = Object.entries(window.Aliucord.pluginManager.plugins).map((plugin) => (
        {
            name: plugin[1].name,
            description: plugin[1].manifest.description,
            version: plugin[1].manifest.version,
            authors: plugin[1].manifest.authors
        }
    ));
    return (
        <View style={styles.container}>
            {!plugins.length ?
                <View style={styles.noPlugins}>
                    <Image source={getAssetId("img_connection_empty_dark")} />
                    <Text style={styles.noPluginsText}>
                        You dont have any plugins installed.
                    </Text>
                </View>
                :
                <FlatList
                    data={plugins}
                    renderItem={({ item }) => <PluginCard
                        key={item.name}
                        plugin={item}
                    />}
                    keyExtractor={plugin => plugin.name}
                    style={styles.list}
                />
            }
        </View>
    );
}

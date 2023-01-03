import { disablePlugin, enablePlugin, isPluginEnabled, plugins } from "../api/PluginManager";
import { PluginManifest } from "../entities/types";
import { Constants, Forms, getByProps, getModule, React, ReactNative, Styles } from "../metro";
import { getAssetId } from "../utils/getAssetId";

const { View, Text, FlatList, Image, ScrollView } = ReactNative;
const Search = getModule(m => m.name === "StaticSearchBarContainer");

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
        flexDirection: "row",
        flexWrap: "wrap"
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
        marginTop: "10%"
    },
    noPluginsText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    },
    search: {
        margin: 0,
        marginBottom: 0,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15,
        backgroundColor: "none",
        borderBottomWidth: 0,
        background: "none"
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
                                {a.name}{i !== plugin.authors.length - 1 && ","}
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
    const [search, setSearch] = React.useState(String);

    const entities = search ? Object.values(plugins).filter(p => {
        const { name, description, authors } = p.manifest;

        if (name.toLowerCase().includes(search.toLowerCase())) {
            return true;
        }

        if (description.toLowerCase().includes(search.toLowerCase())) {
            return true;
        }

        if (authors?.find?.(a => (a.name ?? a).toLowerCase().includes(search.toLowerCase()))) {
            return true;
        }

        return false;
    }) : Object.values(plugins);

    return (<>
        <Search
            style={styles.search}
            placeholder='Search plugins...'
            onChangeText={(v: string) => setSearch(v)}
        />
        <ScrollView style={styles.container}>
            {!entities.length ?
                search ?
                    <View style={styles.noPlugins}>
                        <Image source={getAssetId("img_connection_empty_dark")} />
                        <Text style={styles.noPluginsText}>
                            No results were found.
                        </Text>
                    </View>
                    :
                    <View style={styles.noPlugins}>
                        <Image source={getAssetId("img_connection_empty_dark")} />
                        <Text style={styles.noPluginsText}>
                            You don't have any plugins installed.
                        </Text>
                    </View>
                :
                <FlatList
                    data={entities}
                    renderItem={({ item }) => <PluginCard
                        key={item.name}
                        plugin={item.manifest}
                    />}
                    keyExtractor={plugin => plugin.name}
                    style={styles.list}
                />
            }
        </ScrollView>
    </>);
}

import { disablePlugin, enablePlugin, isPluginEnabled, plugins } from "../api/PluginManager";
import { PluginManifest } from "../entities/types";
import { Constants, FetchUserActions, Forms, getModule, Profiles, React, ReactNative, Styles, URLOpener, Users } from "../metro";
import { getAssetId } from "../utils/getAssetId";

const { View, Text, FlatList, Image, ScrollView, TouchableOpacity } = ReactNative;
const Search = getModule(m => m.name === "StaticSearchBarContainer");

const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1
    },
    list: {
        padding: 5,
    },
    card: {
        borderRadius: 10,
        margin: 5,
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_TERTIARY,
    },
    header: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    divider: {
        width: "100%",
        height: 2,
        borderBottomWidth: 1,
        borderColor: Styles.ThemeColorMap.BACKGROUND_MODIFIER_ACCENT
    },
    bodyCard: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_SECONDARY,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    bodyText: {
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 14
    },
    actions: {
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
        paddingBottom: 10
    },
    icons: {
        width: 22,
        height: 22,
        tintColor: Styles.ThemeColorMap.INTERACTIVE_NORMAL
    },
    text: {
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        color: Styles.ThemeColorMap.TEXT_NORMAL
    },
    link: {
        marginLeft: 3,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
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
                        <Text style={styles.text} adjustsFontSizeToFit={true}>
                            {plugin.name} v{plugin.version} by
                        </Text>
                        {plugin.authors.map((a, i) => (
                            <Text
                                key={a.id}
                                style={styles.link}
                                adjustsFontSizeToFit={true}
                                onPress={() => {
                                    if (!Users.getUser(a.id)) {
                                        FetchUserActions.fetchProfile(a.id).then(() => {
                                            Profiles.showUserProfile({ userId: a.id });
                                        });
                                    } else {
                                        Profiles.showUserProfile({ userId: a.id });
                                    }
                                }}
                            >
                                {a.name}{i !== plugin.authors.length - 1 && ","}
                            </Text>
                        ))}
                    </View>)}
                trailing={<Forms.FormSwitch value={isEnabled} style={{ marginVertical: -12 }} onValueChange={v => {
                    if (v)
                        enablePlugin(plugin.name);
                    else
                        disablePlugin(plugin.name);

                    setIsEnabled(v);
                }} />}
            />
            <View style={styles.divider} />
            <View style={styles.bodyCard}>
                <Forms.FormText style={styles.bodyText} adjustsFontSizeToFit={true}>{plugin.description}</Forms.FormText>
                {plugin.repo ?
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.icons} onPress={() => URLOpener.openURL(plugin.repo)}>
                            <Image source={getAssetId("img_account_sync_github_white")} />
                        </TouchableOpacity>
                    </View>
                    :
                    null
                }
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
                            You dont have any plugins installed.
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

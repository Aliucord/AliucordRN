import { disablePlugin, enablePlugin, isPluginEnabled, plugins, uninstallPlugin } from "../api/PluginManager";
import { Author, PluginManifest } from "../entities";
import { Constants, FetchUserActions, Navigation, Profiles, React, Styles, URLOpener, Users } from "../metro";
import { getAssetId } from "../utils/getAssetId";
import { Button, Forms, General, Search } from "./components";
import { Page } from "./Page";

let removeFromList: (name: string) => void;
const { View, Text, FlatList, Image, ScrollView, Pressable, LayoutAnimation } = General;

const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1
    },
    list: {
        paddingVertical: 14,
        paddingHorizontal: 8
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
    bodyCard: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_SECONDARY,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    bodyText: {
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 18,
        textAlignVertical: "top"
    },
    actions: {
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 16,
        paddingRight: 12,
        paddingBottom: 10
    },
    icons: {
        width: 22,
        height: 22,
        tintColor: Styles.ThemeColorMap.INTERACTIVE_NORMAL
    },
    headerText: {
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontSize: 18
    },
    link: {
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
    },
    button: {
        height: 34,
        paddingHorizontal: 16,
    },
    buttonIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
        color: Styles.ThemeColorMap.TEXT_NORMAL
    }
});

function PluginCard({ plugin }: { plugin: PluginManifest; }) {
    const [isEnabled, setIsEnabled] = React.useState(isPluginEnabled(plugin.name));

    const { FormSwitch, FormText } = Forms;

    return (
        <View style={styles.card}>
            <Forms.FormRow
                label={(
                    <Text style={styles.headerText} adjustsFontSizeToFit={true}>
                        {plugin.name} v{plugin.version ?? "0.0.0"} by {plugin.authors ?
                            plugin.authors.map((a, i) => (
                                a.id ?
                                    <Text
                                        key={a.id}
                                        style={styles.link}
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
                                        {a.name}{i !== (plugin.authors as Author[]).length - 1 && <Text style={styles.headerText}>, </Text>}
                                    </Text>
                                    :
                                    <Text>
                                        {a.name}{i !== (plugin.authors as Author[]).length - 1 && <Text>, </Text>}
                                    </Text>
                            ))
                            :
                            <Text>
                                Unknown
                            </Text>}
                    </Text>
                )}
                trailing={<FormSwitch value={isEnabled} style={{ marginVertical: -15 }} onValueChange={v => {
                    if (v)
                        enablePlugin(plugin.name);
                    else
                        disablePlugin(plugin.name);

                    setIsEnabled(v);
                }} />}
            />
            <View style={styles.bodyCard}>
                <FormText style={styles.bodyText} adjustsFontSizeToFit={true}>{plugin.description ?? "No description provided."}</FormText>
                <View style={styles.actions}>
                    {!!plugin.repo && (
                        <Pressable style={styles.icons} onPress={() => URLOpener.openURL(plugin.repo)}>
                            <Image source={getAssetId("img_account_sync_github_white")} />
                        </Pressable>
                    )}
                    <View style={{ marginLeft: "auto" }}>
                        <View style={{ flexDirection: "row" }} >
                            {!!plugins[plugin.name].getSettingsPage && <Button
                                text="Settings"
                                style={{ ...styles.button, marginHorizontal: 6 }}
                                color='brand'
                                size='small'
                                onPress={() => {
                                    Navigation.push(Page, {
                                        name: plugin.name,
                                        children: plugins[plugin.name].getSettingsPage,
                                    });
                                }}
                                renderIcon={() => <Image
                                    style={styles.buttonIcon}
                                    source={getAssetId("ic_settings_white_24px")}
                                />}
                            />}
                            <Button
                                text="Uninstall"
                                style={styles.button}
                                color='red'
                                size='small'
                                onPress={() => {
                                    uninstallPlugin(plugin.name).then(res => {
                                        res && removeFromList(plugin.name);
                                    });
                                }}
                                renderIcon={() => <Image
                                    style={styles.buttonIcon}
                                    source={getAssetId("ic_trash_filled_16px")}
                                />}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function PluginsPage() {
    const [search, setSearch] = React.useState(String);

    const [entities, setEntities] = React.useState(search ? Object.values(plugins).filter(p => {
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
    }) : Object.values(plugins));

    removeFromList = (name: string) => {
        setEntities(entities.filter(item => item.name !== name));

        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
            }
        });
    };

    return (<>
        <Search
            style={styles.search}
            placeholder='Search plugins...'
            onChangeText={v => setSearch(v)}
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
                            {"You don't have any plugins installed."}
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

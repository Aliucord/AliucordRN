import { disablePlugin, enablePlugin, isPluginEnabled, plugins, uninstallPlugin } from "../../api/PluginManager";
import { Author, Plugin, PluginManifest } from "../../entities";
import { Constants, FetchUserActions, Navigation, Profiles, React, Styles, URLOpener, Users } from "../../metro";
import { getAssetId } from "../../utils/getAssetId";
import { Forms, General, Search } from "../components";
import Card from "../components/Card";
import { Page } from "../Page";

let searchQuery: string;
let updateList: (filter?: (plugin: Plugin) => boolean) => void;

const { View, Text, FlatList, Image, ScrollView, Pressable, LayoutAnimation } = General;
const { FormRow, FormSwitch, FormText } = Forms;

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

function getPlugins(): Plugin[] {
    return searchQuery ? Object.values(plugins).filter(({ manifest }) => {
        const { name, description, authors } = manifest;

        // If there is a search query, return plugins
        return !!(
            name.toLowerCase().includes(searchQuery.toLowerCase())
            || description.toLowerCase().includes(searchQuery.toLowerCase())
            || authors?.find?.(a => (a.name ?? a).toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }) : Object.values(plugins);
}

type HeaderTextProps = {
    title: string,
    version: string,
    authors?: Author[];
};

// TODO: this is a common component, move it to a common place
function HeaderText({ title, version, authors }: HeaderTextProps) {
    const showUserProfile = async (id: string) => {
        if (!Users.getUser(id)) {
            await FetchUserActions.fetchProfile(id);
        }

        Profiles.showUserProfile({ userId: id });

    };

    const isLast = (i) => i !== (authors?.length || -1) - 1;

    const authorList = authors?.map((a, i: number) => (
        <Text
            key={a.id ?? "unknown-author"}
            style={a.id && styles.link || null}
            onPress={() => a.id && showUserProfile(a.id)}
        >
            {a.name}{isLast(i) && <Text style={styles.bodyText}>, </Text>}
        </Text>
    )) ?? "Unknown";

    return (
        <Text style={styles.headerText} adjustsFontSizeToFit={true}>
            {title} <Text style={{ fontSize: 16 }}>
                v{version ?? "0.0.0"} by {authorList}
            </Text>
        </Text>
    );
}

function PluginCard({ plugin }: { plugin: PluginManifest; }) {
    const [isEnabled, setIsEnabled] = React.useState(isPluginEnabled(plugin.name));

    const buttons = [] as any[];

    if (plugins[plugin.name].getSettingsPage) {
        buttons.push({
            text: "Settings",
            onPress: () => {
                Navigation.push(Page, {
                    name: plugin.name,
                    children: plugins[plugin.name].getSettingsPage,
                });
            },
            size: "small",
            color: "brand",
            icon: "ic_settings_white_24px"
        });
    }

    buttons.push({
        text: "Uninstall",
        onPress: () => {
            uninstallPlugin(plugin.name).then(res => {
                res && updateList(x => x.name !== plugin.name);
            });
        },
        size: "small",
        color: "red",
        icon: "ic_trash_filled_16px"
    });

    return (
        <Card
            header={{
                title: plugin.name,
                version: plugin.version,
                authors: plugin.authors
            }}
            trailing={<FormSwitch
                value={isEnabled}
                style={{ marginVertical: -15 }}
                onValueChange={v => {
                    v ? enablePlugin(plugin.name)
                        : disablePlugin(plugin.name);
                    setIsEnabled(v);
                }} />
            }
            description={plugin.description ?? "No description provided."}
            icons={[
                ...(plugin.repo ? [
                    <Pressable key='repo' style={styles.icons} onPress={() => URLOpener.openURL(plugin.repo)}>
                        <Image source={getAssetId("img_account_sync_github_white")} />
                    </Pressable>
                ] : []),
            ]}
            buttons={buttons}
        />
    );
}

export default function PluginsPage() {
    const [entities, setEntities] = React.useState(getPlugins());

    updateList = (filter = () => true) => {
        setEntities(getPlugins().filter(filter));

        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut
            }
        });
    };

    return (<>
        <Search
            style={styles.search}
            placeholder='Search plugins...'
            onChangeText={v => {
                searchQuery = v;
                updateList();
            }}
        />
        <ScrollView style={styles.container}>
            {!entities.length ?
                <View style={styles.noPlugins}>
                    <Image source={getAssetId("img_connection_empty_dark")} />
                    <Text style={styles.noPluginsText}>
                        {searchQuery ? "No results were found." : "You don't have any plugins installed."}
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

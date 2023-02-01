import { disablePlugin, enablePlugin, isPluginEnabled, plugins, uninstallPlugin } from "../../api/PluginManager";
import { Plugin, PluginManifest } from "../../entities";
import { Dialog, Navigation, React, URLOpener } from "../../metro";
import { getAssetId } from "../../utils/getAssetId";
import { Forms, General, Search, styles } from "../components";
import Card from "../components/Card";

let searchQuery: string;
let updateList: (filter?: (plugin: Plugin) => boolean) => void;

const { View, Text, FlatList, Image, ScrollView, Pressable, LayoutAnimation } = General;
const { FormSwitch } = Forms;

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

function PluginCard({ plugin }: { plugin: PluginManifest; }) {
    const [isEnabled, setIsEnabled] = React.useState(isPluginEnabled(plugin.name));

    const buttons = [] as any[];

    const { SettingsModal } = plugins[plugin.name];
    if (SettingsModal) {
        buttons.push({
            text: "Settings",
            onPress: () => Navigation.push(SettingsModal),
            size: "small",
            color: "brand",
            icon: "ic_settings_white_24px"
        });
    }

    buttons.push({
        text: "Uninstall",
        onPress: () => {
            Dialog.show({
                title: `Uninstall ${plugin.name}?`,
                body: "Are you sure? The plugin will stopped and deleted. This action cannot be undone.",
                confirmText: "Uninstall",
                cancelText: "Cancel",
                confirmColor: "red",
                isDismissable: true,
                onConfirm: () => {
                    uninstallPlugin(plugin.name).then(res => {
                        res && updateList(x => x.name !== plugin.name);
                    });
                },
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
                <View style={styles.emptyPageImage}>
                    <Image source={getAssetId("img_connection_empty_dark")} />
                    <Text style={styles.emptyPageText}>
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

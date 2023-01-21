import { setTheme } from "../../api/Themer";
import { Theme } from "../../entities";
import { React, URLOpener } from "../../metro";
import { excludedThemes, InvalidTheme, loadedThemes, themeState } from "../../themer/themerInit";
import { getAssetId } from "../../utils/getAssetId";
import { Forms, General, Search, styles } from "../components";
import Card from "../components/Card";

const { View, Text, FlatList, Image, ScrollView, Pressable, LayoutAnimation } = General;
const { FormIcon, FormRow, FormText, FormRadio } = Forms;

let searchQuery: string;
let updateList: (filter?: (theme: Theme) => boolean) => void;

function getThemes() {
    if (searchQuery) {
        return Object.values(loadedThemes).filter(theme =>
            theme.name.toLowerCase().includes(searchQuery.toLowerCase())
            || theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
            || theme.authors?.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    return Object.values(loadedThemes);
}

function InvalidCard({ invalidTheme }: { invalidTheme: InvalidTheme; }) {
    return (
        <View style={styles.card}>
            <FormRow
                label={(
                    <View style={styles.invalidHeader}>
                        <Text style={styles.invalidInfoText} adjustsFontSizeToFit={true}>
                            INVALID
                        </Text>
                        <Text style={styles.headerText} adjustsFontSizeToFit={true}>
                            {invalidTheme.name}
                        </Text>
                    </View>)}
                leading={<FormIcon source={getAssetId("Small")} color='#FF0000' />}
            />
            {!!invalidTheme.reason && <View style={styles.bodyCard}>
                <FormText style={styles.bodyText} adjustsFontSizeToFit={true}>
                    {invalidTheme.reason}
                </FormText>
            </View>}
        </View>
    );
}

function ThemeCard({ theme }: { theme: Theme; }) {
    const { name, version, description, authors, updater_url } = theme;

    const [isEnabled, setIsEnabled] = React.useState(themeState?.currentTheme === theme.name);
    const hasDuplicate = excludedThemes.duplicatedThemes.includes(theme.name);

    return (
        <Card
            header={{
                title: name,
                version: version,
                authors: authors
            }}
            description={description ?? "No description provided."}
            subLabel={hasDuplicate ? (
                <Text style={styles.warningText} adjustsFontSizeToFit={true}>
                    WARNING: One or more theme with the same name was found and was not loaded.
                </Text>
            ) : null}
            leading={hasDuplicate ? (
                <FormIcon source={getAssetId("yellow-alert")} />
            ) : null}
            trailing={(
                <Pressable onPress={() => {
                    setTheme(themeState?.currentTheme === name ? null : theme);
                    setIsEnabled(!isEnabled);
                }}>
                    <FormRadio selected={isEnabled} />
                </Pressable>
            )}
            icons={[
                ...(updater_url ? [
                    <Pressable key='source' onPress={() => URLOpener.openURL(updater_url)}>
                        <Image source={getAssetId("img_account_sync_github_white")} />
                    </Pressable>
                ] : []),
            ]}
        />
    );
}

export default function ThemesPage() {
    const [entities, setEntities] = React.useState(getThemes());

    updateList = (filter = () => true) => {
        setEntities(getThemes().filter(filter));

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
            placeholder='Search themes...'
            onChangeText={v => {
                searchQuery = v;
                updateList();
            }}
        />
        <ScrollView style={styles.container}>
            {!!excludedThemes.invalidThemes.length && <FlatList
                data={excludedThemes.invalidThemes}
                renderItem={({ item }) => <InvalidCard
                    key={item.name}
                    invalidTheme={{
                        name: item.name,
                        reason: item.reason
                    }}
                />}
                keyExtractor={theme => theme.name}
                style={styles.list}
            />}
            {!entities.length ?
                <View style={styles.noThemes}>
                    <Image source={getAssetId("img_connection_empty_dark")} />
                    <Text style={styles.noThemesText}>
                        {searchQuery ? "No results were found." : "You don't have any themes installed."}
                    </Text>
                </View>
                :
                <FlatList
                    data={entities}
                    renderItem={({ item }) => <ThemeCard
                        key={item.name}
                        theme={item}
                    />}
                    keyExtractor={theme => theme.name}
                    style={styles.list}
                />
            }
        </ScrollView>
    </>);
}

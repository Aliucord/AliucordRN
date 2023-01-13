import { setTheme } from "../api/Themer";
import { Theme } from "../entities";
import { Constants, Forms, getByProps, getModule, React, ReactNative, Styles } from "../metro";
import { excludedThemes, InvalidTheme, loadedThemes, themeState } from "../themer/themerInit";
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
    invalidHeader: {
        flexDirection: "column",
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
    invalidInfoText: {
        color: Styles.ThemeColorMap.TEXT_MUTED,
        fontSize: 12,
        fontWeight: "400"
    },
    warningText: {
        color: Styles.ThemeColorMap.TEXT_WARNING,
        fontFamily: Constants.Fonts.PRIMARY_NORMAL,
        fontSize: 12,
        paddingTop: 5
    },
    link: {
        marginLeft: 5,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        fontSize: 16,
        lineHeight: 22,
        color: Styles.ThemeColorMap.TEXT_LINK
    },
    noThemes: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "10%"
    },
    noThemesText: {
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

function InvalidCard({ invalidTheme }: { invalidTheme: InvalidTheme; }) {
    return (
        <View style={styles.card}>
            <Forms.FormRow
                label={(
                    <View style={styles.invalidHeader}>
                        <Text style={styles.invalidInfoText}>
                            INVALID
                        </Text>
                        <Text style={styles.text}>
                            {invalidTheme.name}
                        </Text>
                    </View>)}
                leading={<Forms.FormIcon source={getAssetId("Small")} color='#FF0000' />}
            />
            {!!invalidTheme.reason && <View style={styles.bodyCard}>
                <Forms.FormText style={styles.bodyText}>{invalidTheme.reason}</Forms.FormText>
            </View>}
        </View>
    );
}

function ThemeCard({ theme }: { theme: Theme; }) {
    const [isEnabled, setIsEnabled] = React.useState(themeState?.currentTheme === theme.name);
    const hasDuplicate = excludedThemes.duplicatedThemes.includes(theme.name);
    return (
        <View style={styles.card}>
            <Forms.FormRow
                label={(
                    <View style={styles.header}>
                        <Text style={styles.text}>
                            {theme.name} v{theme.version} by
                        </Text>
                        {theme.authors.map((a, i) => (
                            <Text
                                key={a.id}
                                style={styles.link}
                                onPress={() => getByProps("showUserProfile").showUserProfile({ userId: a.id })}
                            >
                                {a.name}{i !== theme.authors.length - 1 && ","}
                            </Text>
                        ))}
                    </View>)}
                subLabel={hasDuplicate ? (
                    <Text style={styles.warningText}>
                        WARNING: One or more theme with the same name was found and was not loaded.
                    </Text>
                ) : null}
                leading={hasDuplicate ? (
                    <Forms.FormIcon source={getAssetId("yellow-alert")} />
                ) : null}
                trailing={<Forms.FormRadio selected={isEnabled} />}
                onPress={() => {
                    setTheme(themeState?.currentTheme === theme.name ? null : theme);
                    setIsEnabled(!isEnabled);
                }}
            />
            <View style={styles.bodyCard}>
                <Forms.FormText style={styles.bodyText}>
                    {theme.description}
                </Forms.FormText>
            </View>
        </View>
    );
}

export default function ThemesPage() {
    const [search, setSearch] = React.useState(String);

    const entities = search ? Object.values(loadedThemes).filter(theme => {
        const { name, description, authors } = theme;

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
    }) : Object.values(loadedThemes);

    return (<>
        <Search
            style={styles.search}
            placeholder='Search themes...'
            onChangeText={(v: string) => setSearch(v)}
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
                search ?
                    <View style={styles.noThemes}>
                        <Image source={getAssetId("img_connection_empty_dark")} />
                        <Text style={styles.noThemesText}>
                            No results were found.
                        </Text>
                    </View>
                    :
                    <View style={styles.noThemes}>
                        <Image source={getAssetId("img_connection_empty_dark")} />
                        <Text style={styles.noThemesText}>
                            {"You don't have any themes installed."}
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

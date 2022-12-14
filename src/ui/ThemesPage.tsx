import { Constants, React, Styles, ReactNative } from "../metro";
import { getAssetId } from "../utils";

const { Image, View, Text, ScrollView } = ReactNative;

const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1,
        padding: 5
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
});

export default function ThemesPage() {
    return (<>
        <ScrollView style={styles.container}>
            <View style={styles.noThemes}>
                <Image source={getAssetId("img_connection_empty_dark")} />
                <Text style={styles.noThemesText}>
                    Themes are coming soon.
                </Text>
            </View>
        </ScrollView>
    </>);
}

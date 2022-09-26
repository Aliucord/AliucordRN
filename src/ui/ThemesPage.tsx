import { Constants, React, Styles, ReactNative } from "../metro";
import { getAssetId } from "../utils";

const { Image, View, Text } = ReactNative;

const styles = Styles.createThemedStyleSheet({
    noThemes: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "50%"
    },
    noThemesText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    },
});

export default function ThemesPage() {
    return (
        <>
            <View style={styles.noThemes}>
                <Image source={getAssetId("img_connection_empty_dark")} />
                <Text style={styles.noThemesText}>
                    Themes are coming soon.
                </Text>
            </View>
        </>
    );
}

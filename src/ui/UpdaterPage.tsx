import { Constants, React, Styles, ReactNative } from "../metro";
import { getAssetId } from "../utils";

const { Image, View, Text } = ReactNative;

const styles = Styles.createThemedStyleSheet({
    comingSoonUpdater: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "50%"
    },
    comingSoonUpdaterText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    },
});

export default function UpdaterPage() {
    return (
        <>
            <View style={styles.comingSoonUpdater}>
                <Image source={getAssetId("img_connection_empty_dark")} />
                <Text style={styles.comingSoonUpdaterText}>
                    The Updater is coming soon.
                </Text>
            </View>
        </>
    );
}

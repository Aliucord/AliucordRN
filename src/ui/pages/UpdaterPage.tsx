import { Constants, React, Styles } from "../../metro";
import { getAssetId } from "../../utils";
import { General } from "../components";

const { Image, View, Text, ScrollView } = General;

const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1,
        padding: 5
    },
    comingSoonUpdater: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "10%"
    },
    comingSoonUpdaterText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    },
});

export default function UpdaterPage() {
    return (<>
        <ScrollView style={styles.container}>
            <View style={styles.comingSoonUpdater}>
                <Image source={getAssetId("img_connection_empty_dark")} />
                <Text style={styles.comingSoonUpdaterText}>
                    The Updater is coming soon.
                </Text>
            </View>
        </ScrollView>
    </>);
}

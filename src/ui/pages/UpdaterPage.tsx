import { React } from "../../metro";
import { getAssetId } from "../../utils";
import { General, styles } from "../components";

const { Image, View, Text, ScrollView } = General;

export default function UpdaterPage() {
    return (<>
        <ScrollView style={styles.container}>
            <View style={styles.emptyPageImage}>
                <Image source={getAssetId("img_connection_empty_dark")} />
                <Text style={styles.emptyPageText}>
                    The Updater is coming soon.
                </Text>
            </View>
        </ScrollView>
    </>);
}

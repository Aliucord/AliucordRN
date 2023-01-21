import { plugins } from "../../api";
import { React } from "../../metro";
import { getAssetId } from "../../utils";
import { General, styles } from "../components";
import Card from "../components/Card";

const { Image, ScrollView, View, Text, FlatList } = General;

interface ErrorCardProps {
    header: string;
    error: string;
}

function ErrorCard({ log }: { log: ErrorCardProps; }) {
    return (
        <Card
            header={log.header}
            description={log.error}
            leading={<Image source={getAssetId("Small")} />}
        />
    );
}

export default function ErrorsPage() {
    // Aliucord errors
    const errors = Object.entries(window.Aliucord.errors).map(([source, error]) => ({
        header: source,
        error: error
    })) as ErrorCardProps[];

    // Loaded plugin errors
    errors.concat(Object.values(plugins).filter(plugin => plugin.errors.length).map(plugin => ({
        header: `${plugin.name} v${plugin.manifest.version} had an error.`,
        error: plugin.errors.join("\n")
    }))) as ErrorCardProps[];

    return (<>
        <ScrollView style={styles.container}>
            {errors.length ?
                <FlatList
                    data={errors}
                    renderItem={({ item }) => <ErrorCard
                        key={item.header}
                        log={item}
                    />}
                    keyExtractor={log => log.header}
                    style={styles.list}
                />
                :
                <View style={styles.emptyPageImage}>
                    <Image source={getAssetId("img_connection_empty_dark")} />
                    <Text style={styles.emptyPageText}>
                        There are no errors.
                    </Text>
                </View>
            }
        </ScrollView>
    </>);
}

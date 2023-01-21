import { plugins } from "../../api";
import { React } from "../../metro";
import { getAssetId } from "../../utils";
import { Forms, General, styles } from "../components";

const { Image, ScrollView, View, Text, FlatList } = General;
const { FormRow, FormText } = Forms;

interface PluginLogs {
    plugin: {
        version: string;
        name: string;
    };
    errors: Record<string, string>;
}[];

function ErrorCard({ log }: { log: PluginLogs; }) {
    return (
        <View style={styles.card}>
            <FormRow
                label={(
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {log.plugin.name} (v{log.plugin.version ?? "0.0.0"}) had an error.
                        </Text>
                    </View>
                )} />
            <View style={styles.bodyCard}>
                <FormText style={styles.bodyText}>{log.errors}</FormText>
            </View>
        </View>
    );
}

export default function ErrorsPage() {
    const errors = [
        ...Object.values(plugins).map(p => {
            let logs!: PluginLogs;
            if (Object.keys(p.errors).length) logs = { plugin: { name: p.manifest.name, version: p.manifest.version }, errors: p.errors };

            return logs;
        })
    ].filter(value => value !== undefined);
    return (<>
        <ScrollView style={styles.container}>
            {errors.length ?
                <FlatList
                    data={errors}
                    renderItem={({ item }) => <ErrorCard
                        key={item.plugin.name}
                        log={item}
                    />}
                    keyExtractor={log => log.plugin.name}
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

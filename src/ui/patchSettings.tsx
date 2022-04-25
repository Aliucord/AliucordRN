import { sha } from "aliucord-version";
import { Forms, getModule, i18n, React, ReactNative as RN } from "../metro";
import { after } from "../utils/Patcher";
import AliucordPage from "./AliucordPage";
import UpdaterPage from "./UpdaterPage";


export default function patchSettings() {
    const { FormSection, FormRow } = Forms;
    const UserSettingsOverviewWrapper = getModule(m => m.default?.name === "UserSettingsOverviewWrapper");

    after(getModule(m => m.default?.name === "getScreens"), "default", (_, res) => {
        res.ASettings = {
            title: "Aliucord",
            render: AliucordPage
        };
        res.APlugins = {
            title: "Plugins",
            render: () => <RN.Text>Hello World</RN.Text>
        };
        res.AThemes = {
            title: "Themes",
            render: () => <RN.Text>Hello World</RN.Text>
        };
        res.AUpdater = {
            title: "Updater",
            render: UpdaterPage
        };

        // TODO: add APluginWrapper and make it work?
        // Or should we add all plugins that register settings to this?
    });

    const unpatch = after(UserSettingsOverviewWrapper, "default", (_, res) => {
        unpatch();

        const { navigation } = res.props;

        // Yeet the funny Upload Logs button
        after(res.type.prototype, "renderSupportAndAcknowledgements", (_, { props }) => {
            const idx = props.children.findIndex(c => c?.type?.name === "UploadLogsButton");
            if (idx !== -1) {
                props.children.splice(idx, 1);
            }
        });

        after(res.type.prototype, "render", (_, { props }) => {
            const nitroIndex = props.children.findIndex(c => c?.props?.title === i18n.Messages.PREMIUM_SETTINGS);
            window.nitro = props.children[nitroIndex];

            const aliucordSection = (
                <FormSection key="AliucordSection" title={`Aliucord (${sha})`} >
                    <FormRow
                        label="Aliucord"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("ASettings")
                        }
                    />
                    <FormRow
                        label="Plugins"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("APlugins")
                        }
                    />
                    <FormRow
                        label="Themes"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AThemes")
                        }
                    />
                    <FormRow
                        label="Updater"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AUpdater")
                        }
                    />
                </FormSection>
            );

            props.children.splice(nitroIndex, 0, aliucordSection);
        });
    });
}

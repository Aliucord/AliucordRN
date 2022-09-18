import { sha } from "aliucord-version";
import { Forms, getByName, Locale, React } from "../metro";
import { findInReactTree } from "../utils/findInReactTree";
import { after } from "../utils/patcher";
import { getAssetId } from "../utils/getAssetId";
import AliucordPage from "./AliucordPage";
import PluginsPage from "./PluginsPage";
import UpdaterPage from "./UpdaterPage";
import ThemesPage from "./ThemesPage";

export default function patchSettings() {
    const { FormSection, FormRow } = Forms;
    const UserSettingsOverviewWrapper = getByName("UserSettingsOverviewWrapper", { default: false });
    after(getByName("getScreens"), "default", (_, res) => {
        res.ASettings = {
            title: "Aliucord",
            render: AliucordPage
        };
        res.APlugins = {
            title: "Plugins",
            render: PluginsPage
        };
        res.AThemes = {
            title: "Themes",
            render: ThemesPage
        };
        res.AUpdater = {
            title: "Updater",
            render: UpdaterPage
        };

        // TODO: add APluginWrapper and make it work?
        // Or should we add all plugins that register settings to this?
    });

    const unpatch = after(UserSettingsOverviewWrapper, "default", (_, res) => {
        const Overview = findInReactTree(res, m => m.type?.name === "UserSettingsOverview");

        // Yeet the funny Upload Logs button
        after(Overview.type.prototype, "renderSupportAndAcknowledgements", (_, { props }) => {
            const idx = props.children.findIndex(c => c?.type?.name === "UploadLogsButton");
            if (idx !== -1) {
                props.children.splice(idx, 1);
            }
        });

        after(Overview.type.prototype, "render", (_, { props }) => {
            const { children } = props;

            const searchable = [Locale.Messages["BILLING_SETTINGS"], Locale.Messages["PREMIUM_SETTINGS"]];
            const index = children.findIndex(x => searchable.includes(x.props.title));

            children.splice(index === -1 ? 4 : index, 0, <>
                <FormSection key="AliucordSection" title={`Aliucord (${sha})`} >
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("Discord")} />}
                        label="Aliucord"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            Overview.props.navigation.push("ASettings")
                        }
                    />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_settings")} />}
                        label="Plugins"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            Overview.props.navigation.push("APlugins")
                        }
                    />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_theme_24px")} />}
                        label="Themes"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            Overview.props.navigation.push("AThemes")
                        }
                    />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_share_ios")} />}
                        label="Updater"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            Overview.props.navigation.push("AUpdater")
                        }
                    />
                </FormSection>
            </>);
        });
        unpatch();
    });
}

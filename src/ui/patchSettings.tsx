import { sha } from "aliucord-version";
import { Forms, getByName, Locale, React, Scenes } from "../metro";
import { findInReactTree } from "../utils/findInReactTree";
import { getAssetId } from "../utils/getAssetId";
import { after } from "../utils/patcher";
import AliucordPage from "./AliucordPage";
import ErrorsPage from "./ErrorsPage";
import PluginsPage from "./PluginsPage";
import ThemesPage from "./ThemesPage";
import UpdaterPage from "./UpdaterPage";

export default function patchSettings() {
    const { FormSection, FormDivider, FormRow } = Forms;
    const UserSettingsOverviewWrapper = getByName("UserSettingsOverviewWrapper", { default: false });

    after(Scenes, "default", (_, res) => {
        return {
            ...res,
            Aliucord: {
                key: "Aliucord",
                title: "Aliucord",
                render: AliucordPage
            },
            AliucordPlugins: {
                key: "AliucordPlugins",
                title: "Plugins",
                render: PluginsPage
            },
            AliucordThemes: {
                key: "AliucordThemes",
                title: "Themes",
                render: ThemesPage
            },
            AliucordUpdater: {
                key: "AliucordUpdater",
                title: "Updater",
                render: UpdaterPage
            },
            AliucordErrors: {
                key: "AliucordErrors",
                title: "Errors",
                render: ErrorsPage
            }
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

        after(Overview.type.prototype, "render", (res, { props }) => {
            const { children } = props;
            const { navigation } = res.thisObject.props;

            const searchable = [Locale.Messages["BILLING_SETTINGS"], Locale.Messages["PREMIUM_SETTINGS"]];
            const index = children.findIndex(x => searchable.includes(x.props.title));

            children.splice(index === -1 ? 4 : index, 0, <>
                <FormSection key="AliucordSection" title={`Aliucord (${sha})`} >
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("Discord")} />}
                        label="Aliucord"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("Aliucord", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_settings")} />}
                        label="Plugins"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordPlugins", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_theme_24px")} />}
                        label="Themes"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordThemes", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_share_ios")} />}
                        label="Updater"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordUpdater", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormRow.Icon source={getAssetId("ic_settings")} />}
                        label="Errors"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordErrors", { navigation })
                        }
                    />
                </FormSection>
            </>);
        });
        unpatch();
    });
}

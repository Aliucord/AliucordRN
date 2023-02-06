import { sha } from "aliucord-version";
import { getByName, Locale, NavigationNative, React, Scenes } from "../metro";
import { findInReactTree, getAssetId } from "../utils";
import { after } from "../utils/patcher";

import { Forms } from "../ui/components";
import AliucordPage from "../ui/pages/AliucordPage";
import ErrorsPage from "../ui/pages/ErrorsPage";
import PluginsPage from "../ui/pages/PluginsPage";
import ThemesPage from "../ui/pages/ThemesPage";
import UpdaterPage from "../ui/pages/UpdaterPage";

export default function patchSettings() {
    const { FormSection, FormDivider, FormRow, FormIcon } = Forms;
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
            },
            // Render custom page dynamically. For options, some props from https://reactnavigation.org/docs/native-stack-navigator#options are valid
            AliucordCustomPage: {
                key: "AliucordCustomPage",
                title: "Aliucord Page",
                render: ({ render: PageView, ...options }) => {
                    const navigation = NavigationNative.useNavigation();

                    React.useEffect(() => {
                        options && navigation.setOptions({ ...options });
                    }, []);

                    return <PageView />;
                }
            }
        };
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
                        leading={<FormIcon source={getAssetId("Discord")} />}
                        label="Aliucord"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("Aliucord", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormIcon source={getAssetId("ic_settings")} />}
                        label="Plugins"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordPlugins", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormIcon source={getAssetId("ic_theme_24px")} />}
                        label="Themes"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordThemes", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormIcon source={getAssetId("ic_share_ios")} />}
                        label="Updater"
                        trailing={FormRow.Arrow}
                        onPress={() =>
                            navigation.push("AliucordUpdater", { navigation })
                        }
                    />
                    <FormDivider />
                    <FormRow
                        leading={<FormIcon source={getAssetId("ic_settings")} />}
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

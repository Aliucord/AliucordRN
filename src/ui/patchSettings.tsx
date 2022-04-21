import type { JSXElementConstructor } from "react";
import { ALIUCORD_INVITE } from "../constants";
import { getByProps, getModule, i18n, React, ReactNative } from "../metro";
import { URLOpener } from "../metro/index";
import { findInReactTree } from "../utils/findInReactTree";
import { after } from "../utils/Patcher";

const UserSettingsOverviewWrapper = getModule(m => m.default?.name === "UserSettingsOverviewWrapper");
let UserSettingsOverview: JSXElementConstructor<any>;

export default function patchSettings() {
    const { FormSection, FormRow } = getByProps("FormSection");
    const nav = getByProps("pushLazy", "push");

    const unpatch = after(UserSettingsOverviewWrapper, "default", ({ result }) => {
        if (UserSettingsOverview) {
            return;
        }

        unpatch();

        UserSettingsOverview = result.type as JSXElementConstructor<any>;

        after(UserSettingsOverview.prototype, "render", ({ result }) => {
            const { children } = result.props;

            const supportComponent = findInReactTree(children, c => c?.children && Array.isArray(c.children) && c.children.some(x => x?.type?.name === "UploadLogsButton"));
            for (let i = 0; i < supportComponent.children.length; i++) {
                const child = supportComponent.children[i];
                if (child.props?.label === i18n.Messages.SUPPORT) {
                    child.props.onPress = async () => {
                        URLOpener.openURL(ALIUCORD_INVITE);
                    };
                } else if (child.type?.name === "UploadLogsButton") {
                    supportComponent.children.splice(i, 1);
                    i--;
                }
            }

            const nitroIndex = children.findIndex(c => c?.props?.title === i18n.Messages.PREMIUM_SETTINGS);
            const nitro = children[nitroIndex];

            const aliucordSection = (
                <FormSection key="AliucordSection" title="Aliucord" titleTextStyle={nitro.props.titleTextStyle} titleWrapperStyle={nitro.props.titleWrapperStyle} >
                    <FormRow
                        key={"ASettings"}
                        label={"Aliucord Settings"}
                        arrowShown={true}
                        onPress={() =>
                            nav.push(() => <ReactNative.Text>Lol</ReactNative.Text>, {})
                        }
                    />
                    <FormRow
                        key={"APlugins"}
                        label={"Plugins"}
                        arrowShown={true}
                        onPress={() =>
                            nav.push(() => <ReactNative.Text>Lol</ReactNative.Text>, {})
                        }
                    />
                    <FormRow
                        key={"AThemes"}
                        label={"Themes"}
                        arrowShown={true}
                        onPress={() =>
                            nav.push(() => <ReactNative.Text>Lol</ReactNative.Text>, {})
                        }
                    />
                    <FormRow
                        key={"AUpdater"}
                        label={"Updater"}
                        arrowShown={true}
                        onPress={() =>
                            nav.push(() => <ReactNative.Text>Lol</ReactNative.Text>, {})
                        }
                    />
                </FormSection>
            );

            children.splice(nitroIndex, 0, aliucordSection);
        });
    });
}

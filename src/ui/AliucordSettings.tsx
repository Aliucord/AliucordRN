import type { ReactElement, JSXElementConstructor } from "react";
import { getModule } from "../metro";
import { after } from "../utils/Patcher";

const UserSettingsOverviewWrapper = getModule(m => m.default?.name === "UserSettingsOverviewWrapper");
let UserSettingsOverview: JSXElementConstructor<any>;

export class AliucordSettings {
    patch() {
        const React = getModule(m => m.createElement);
        const Messages = getModule(x => x.default?.Messages).default.Messages;

        const unpatch = after<any, ReactElement, [props: { disableHeader: boolean }, ref: never]>(UserSettingsOverviewWrapper, "default", ({ result }) => {
            if (UserSettingsOverview !== undefined) {
                return;
            }

            unpatch();

            UserSettingsOverview = result.type as JSXElementConstructor<any>;

            after<any, ReactElement<{ children: ReactElement[] }>, []>(UserSettingsOverview.prototype, "render", ({ result }) => {
                const children = result.props.children;
                const nitroIndex = children.findIndex(x => x.props.title === Messages["PREMIUM_SETTINGS"]);
                const nitro = children[nitroIndex];

                const { FormSection, FormRow } = getModule(m => m.FormSection);

                const aliucordSection = <FormSection title="Aliucord" titleTextStyle={nitro.props.titleTextStyle} titleWrapperStyle={nitro.props.titleWrapperStyle}>
                    <FormRow label="o/" arrowShown={true} onPress={() => alert("hello!")} />
                </FormSection>;

                children.splice(nitroIndex, 0, aliucordSection);
            });
        });
    }
}

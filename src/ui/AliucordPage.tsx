import { SettingsSchema } from "../Aliucord";
import { useSettings } from "../api/Settings";
import { Forms, React } from "../metro";
import { URLOpener } from "../metro/index";
import { ALIUCORD_GITHUB, ALIUCORD_INVITE, ALIUCORD_PATREON } from "../utils/constants";
import { startDebugWs } from "../utils/debug/DebugWS";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormSwitch, FormRow } = Forms;

export default function AliucordPage() {
    const settings = useSettings(window.Aliucord.settings);
    const [state, setState] = React.useState<Omit<SettingsSchema, "plugins">>({
        autoUpdateAliucord: settings.get("autoUpdateAliucord", false),
        autoUpdatePlugins: settings.get("autoUpdatePlugins", false),
        disablePluginsOnCrash: settings.get("disablePluginsOnCrash", true),
        debugWS: settings.get("debugWS", false),
    });

    return (
        <>
            <FormSection title="Settings" /* Nice prop name discord */ android_noDivider={true}>
                <FormRow
                    label="Automatically disable plugins on crash"
                    trailing={<FormSwitch value={state.disablePluginsOnCrash} onValueChange={v => {
                        settings.set("disablePluginsOnCrash", v);
                        setState({ ...state, disablePluginsOnCrash: v });
                    }} />}
                />
                <FormRow
                    label="Automatically update Aliucord"
                    trailing={<FormSwitch value={state.autoUpdateAliucord} onValueChange={v => {
                        settings.set("autoUpdateAliucord", v);
                        setState({ ...state, autoUpdateAliucord: v });
                    }} />}
                />
                <FormRow
                    label="Automatically update Plugins"
                    trailing={<FormSwitch value={state.autoUpdatePlugins} onValueChange={v => {
                        settings.set("autoUpdatePlugins", v);
                        setState({ ...state, autoUpdatePlugins: v });
                    }} />}
                />
                <FormRow
                    label="Enable Debug WebSocket"
                    trailing={<FormSwitch
                        value={state.debugWS}
                        onValueChange={v => {
                            settings.set("debugWS", v);
                            setState({ ...state, debugWS: v });
                            if (v) startDebugWs();
                        }}
                    />}
                />
            </FormSection>
            <FormSection title="Socials">
                <FormRow
                    label="Source Code"
                    leading={<FormRow.Icon source={getAssetId("img_account_sync_github_white")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => URLOpener.openURL(ALIUCORD_GITHUB)}
                />
                <FormRow
                    label="Support Server"
                    leading={<FormRow.Icon source={getAssetId("img_help_icon")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => URLOpener.openURL(ALIUCORD_INVITE)}
                />
                <FormRow
                    label="Support Us"
                    leading={<FormRow.Icon source={getAssetId("ic_premium_perk_heart_24px")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => URLOpener.openURL(ALIUCORD_PATREON)}
                />
            </FormSection>
        </>
    );
}

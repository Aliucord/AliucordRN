import { SettingsSchema } from "../Aliucord";
import { useSettings } from "../api/Settings";
import { Forms, React } from "../metro";
import { URLOpener } from "../metro/index";
import { ALIUCORD_GITHUB, ALIUCORD_INVITE, ALIUCORD_PATREON } from "../utils/constants";
import { startDebugWs } from "../utils/debug/DebugWS";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormSwitch, FormRow } = Forms;

export default function AliucordPage() {
    const settings = useSettings<Omit<SettingsSchema, "plugins">>(window.Aliucord.settings, {
        autoUpdateAliucord: false,
        autoUpdatePlugins: false,
        debugWS: false,
        disablePluginsOnCrash: true
    });

    return (
        <>
            <FormSection title="Settings" /* Nice prop name discord */ android_noDivider={true}>
                <FormRow
                    label="Automatically disable plugins on crash"
                    trailing={<FormSwitch value={settings.disablePluginsOnCrash} onValueChange={v => {
                        settings.disablePluginsOnCrash = v;
                    }} />}
                />
                <FormRow
                    label="Automatically update Aliucord"
                    trailing={<FormSwitch value={settings.autoUpdateAliucord} onValueChange={v => {
                        settings.autoUpdateAliucord = v;
                    }} />}
                />
                <FormRow
                    label="Automatically update Plugins"
                    trailing={<FormSwitch value={settings.autoUpdatePlugins} onValueChange={v => {
                        settings.autoUpdatePlugins = v;
                    }} />}
                />
                <FormRow
                    label="Enable Debug WebSocket"
                    trailing={<FormSwitch
                        value={settings.debugWS}
                        onValueChange={v => {
                            settings.debugWS = v;
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

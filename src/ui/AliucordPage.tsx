import { aliucord } from "..";
import { useSettings } from "../api/Settings";
import { Forms, React } from "../metro";
import { URLOpener } from "../metro/index";
import { ALIUCORD_GITHUB, ALIUCORD_INVITE, ALIUCORD_PATREON } from "../utils/constants";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormSwitch, FormRow } = Forms;

export default function AliucordPage() {
    const settings = useSettings(aliucord.settings);

    return (
        <>
            <FormSection title="Settings" /* Nice prop name discord */ android_noDivider={true}>
                <FormRow
                    label="Automatically disable plugins on crash"
                    trailing={<FormSwitch value={settings.get("disablePluginsOnCrash", true)} onValueChange={v => settings.set("disablePluginsOnCrash", v)} />}
                />
                <FormRow
                    label="Automatically update Aliucord"
                    trailing={<FormSwitch value={settings.get("autoUpdateAliucord", false)} onValueChange={v => settings.set("autoUpdateAliucord", v)} />}
                />
                <FormRow
                    label="Automatically update Plugins"
                    trailing={<FormSwitch value={settings.get("autoUpdatePlugins", false)} onValueChange={v => settings.set("autoUpdatePlugins", v)} />}
                />
                <FormRow
                    label="Enable debug websocket"
                    trailing={<FormSwitch value={settings.get("debugWS", false)} onValueChange={v => {
                        settings.set("autoUpdatePlugins", v);
                        v
                            ? aliucord.debugWS.start()
                            : aliucord.debugWS.stop();
                    }} />}
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

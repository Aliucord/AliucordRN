import { Settings } from "../api/SettingsAPI";
import { Forms, React } from "../metro";
import { URLOpener } from "../metro/index";
import { ALIUCORD_GITHUB, ALIUCORD_INVITE, ALIUCORD_PATREON } from "../utils/constants";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormSwitch, FormRow } = Forms;

// TODO: make this work
/*
before(getModule(m => m.prototype?.fromSource).prototype, "fromSource", (ctx, source: string) => {
    if (source.startsWith("aliucord_")) {
        // Must not be empty
        ctx.thisObject.serverUrl = "h";
        ctx.thisObject.asset.httpServerLocation = ctx.thisObject.asset.httpServerLocation.slice(10);
        ctx.result = ctx.thisObject.assetServerURL();
        console.log(ctx);
    }
});

const id = getByProps("registerAsset").registerAsset({
    __packager_asset: true,
    httpServerLocation: "aliucord_https://raw.githubusercontent.com/Aliucord/Aliucord/main/installer/android/app/src/main/assets",
    scales: [1],
    width: 432,
    height: 432,
    name: "icon1",
    type: "png"
});
console.log("Registered icon", id); */

// TODO move this to a more appropriate file trolley
function useSettings<T>(settings: Settings<T>) {
    const [, update] = React.useState(0);

    return React.useMemo(() => ({
        get<K extends keyof T, V extends T[K]>(key: K, defaultValue: V) {
            return settings.get(key, defaultValue);
        },
        set<K extends keyof T, V extends T[K]>(key: K, value: V) {
            settings.set(key, value).then(() => update(x => x + 1));
        }
    }), []);
}

export default function AliucordPage() {
    const settings = useSettings(window.Aliucord.settings);

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

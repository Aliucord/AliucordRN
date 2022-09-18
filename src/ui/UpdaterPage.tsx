import { Forms, React } from "../metro";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormRow } = Forms;

export default function UpdaterPage() {
    return (
        <>
            <FormSection title="Updater" android_noDivider={true}>
                <FormRow
                    leading={<FormRow.Icon source={getAssetId("ic_share_ios")}  />}
                    label="Coming soon"
                />
            </FormSection>
        </>
    );
}

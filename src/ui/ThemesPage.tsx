import { Forms, React } from "../metro";
import { getAssetId } from "../utils/getAssetId";

const { FormSection, FormRow } = Forms;

export default function ThemesPage() {
    return (
        <>
            <FormSection title="Themes" android_noDivider={true}>
                <FormRow
                    leading={<FormRow.Icon source={getAssetId("ic_warning_24px")} />}
                    label="Coming soon"
                />
            </FormSection>
        </>
    );
}

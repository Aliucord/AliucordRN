import { Button, Forms, General, styles } from ".";
import { Author } from "../../entities";
import { FetchUserActions, Profiles, React, Users } from "../../metro";
import { getAssetId } from "../../utils";

type HeaderTextProps = {
    title: string,
    version: string,
    authors?: Author[];
};

type Buttons = {
    text: string,
    onPress: () => void,
    size: "small" | "medium" | string,
    color: "red" | "brand" | string;
    icon?: string,
    style?: { [key: string]: any; },
};

type CardProps = {
    header: HeaderTextProps | string,
    description: Text | string,
    subLabel?: JSX.Element | null,
    leading?: JSX.Element | null,
    trailing?: JSX.Element | null,
    icons?: (JSX.Element | null)[],
    buttons?: Buttons[];
};

function HeaderText({ title, version, authors }: HeaderTextProps) {
    const { Text } = General;

    const showUserProfile = async (id: string) => {
        if (!Users.getUser(id)) {
            await FetchUserActions.fetchProfile(id);
        }

        Profiles.showUserProfile({ userId: id });
    };

    const isNotLast = (i: number) => i !== (authors?.length || -1) - 1;

    const authorList = authors?.map((a, i: number) => (
        <Text
            key={a.id ?? "unknown-author"}
            style={a.id && styles.link || null}
            onPress={() => a.id && showUserProfile(a.id)}
        >
            {a.name}{isNotLast(i) && <Text style={styles.bodyText}>, </Text>}
        </Text>
    )) ?? "Unknown";

    return (
        <Text style={styles.headerText} adjustsFontSizeToFit={true}>
            {title} <Text style={{ fontSize: 16 }}>
                v{version ?? "0.0.0"} by {authorList}
            </Text>
        </Text>
    );
}

export default function Card({ header, subLabel, leading, trailing, description, icons, buttons }: CardProps) {
    const { View, Image } = General;
    const { FormRow, FormText } = Forms;

    return (
        <View style={styles.card}>
            <FormRow
                label={typeof header === "string" ? header : <HeaderText {...header} />}
                subLabel={subLabel || null}
                trailing={trailing || null}
                leading={leading || null}
            />
            <View style={styles.bodyCard}>
                <FormText style={styles.bodyText} adjustsFontSizeToFit={true}>
                    {description}
                </FormText>
                { /* Actions container */
                    !!(icons?.length || buttons?.length) &&
                    <View style={styles.actions}>
                        {!!icons?.length && <View style={styles.icons}>
                            {icons}
                        </View>}
                        { /* Buttons container */}
                        <View style={{ marginLeft: "auto" }}>
                            <View style={{ flexDirection: "row" }}>
                                {buttons?.map(({ text, onPress, size, color, icon, style }, i) => (
                                    <Button
                                        key={i}
                                        text={text}
                                        onPress={onPress}
                                        size={size}
                                        color={color}
                                        renderIcon={icon ? () => <Image
                                            style={styles.buttonIcon}
                                            source={icon && getAssetId(icon)}
                                        /> : null}
                                        style={[styles.button, style]}
                                    />
                                )) ?? null}
                            </View>
                        </View>
                    </View>
                }
            </View>
        </View>
    );
}

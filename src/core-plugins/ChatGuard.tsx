import { Plugin } from "../entities";
import { Dialog, Forms, getByName, React, ReactNative, Styles } from "../metro";
import { getAssetId } from "../utils";

const { FormRow, FormIcon } = Forms;

export default class ChatGuard extends Plugin {
    CHANNEL_IDS = [
        "811255667469582420", // #offtopic
        "811261478875299840", // #plugin-development
        "868419532992172073", // #theme-development
        "865188789542060063", // #related-development
        "811262084968742932", // #core-development
    ];

    MESSAGE = "PLEASE READ: This is not a support channel, do not ask for help! This is NOT A SUPPORT CHANNEL. Do NOT ask for help about using or installing a plugin or theme here or you will be muted.";
    MESSAGE_SHORT = "PLEASE READ: This is not a support channel, do not ask for help!";

    public async start() {
        const settings = window.Aliucord.settings;

        const styles = Styles.createThemedStyleSheet({
            chatbox: {
                "borderColor": "#202225",
                "borderTopWidth": 0.36363636363636365,
                "padding": 6,
                "paddingVertical": 8,
                "paddingLeft": 4,
                "paddingRight": 4
            }
        });

        const ChatInputGuard = getByName("ChatInputGuard");
        this.patcher.after(ChatInputGuard.default.prototype, "render", (_, component: any) => {
            const chatInput = component.props.children.find(c => c?.props?.accessibilityLabel != undefined);
            const channelId = chatInput?.props?.channel?.id;
            if (this.CHANNEL_IDS.includes(channelId)) {
                component.props.children = [
                    <>
                        {
                            settings.get("acknowlegedNoSupportChannels", false) ? component.props.children :

                                <ReactNative.View
                                    style={styles.chatbox}>
                                    <FormRow
                                        label={this.MESSAGE_SHORT}
                                        leading={<FormIcon source={getAssetId("ic_warning_24px")} />}
                                        trailing={FormRow.Arrow}

                                        onPress={() => {
                                            Dialog.show({
                                                title: "PLEASE READ",
                                                body: this.MESSAGE,
                                                confirmText: "I understand",
                                                isDismissable: false,
                                                onConfirm: () => settings.set("acknowlegedNoSupportChannels", true)
                                            });
                                        }}
                                    />
                                </ReactNative.View>
                        }
                    </>
                ];
            }
        });
    }
}

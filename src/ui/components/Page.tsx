import { General } from ".";
import { Constants, Navigation, NavigationNative, NavigationStack, React, Styles } from "../../metro";
import { getAssetId } from "../../utils";

interface Props {
    name: string;
    children: JSX.Element;
}

const styles = Styles.createThemedStyleSheet({
    container: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_SECONDARY,
        flex: 1,
    },
    card: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_PRIMARY,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
    },
    header: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_SECONDARY,
        shadowColor: "transparent",
        elevation: 0,
    },
    headerTitleContainer: {
        color: Styles.ThemeColorMap.HEADER_PRIMARY,
    },
    headerTitle: {
        fontFamily: Constants.Fonts.PRIMARY_BOLD,
        color: Styles.ThemeColorMap.HEADER_PRIMARY,
    },
    backIcon: {
        tintColor: Styles.ThemeColorMap.INTERACTIVE_ACTIVE,
        marginLeft: 15,
        marginRight: 20,
    }
});

export function Page({ name, children }: Props) {
    const Settings = NavigationStack.createStackNavigator();
    const { TouchableOpacity, Image } = General;

    return (
        <NavigationNative.NavigationContainer independent>
            <Settings.Navigator
                initialRouteName={name}
                style={styles.container}
                screenOptions={{
                    cardOverlayEnabled: false,
                    cardShadowEnabled: false,
                    cardStyle: styles.card,
                    headerStyle: styles.header,
                    headerTitleContainerStyle: styles.headerTitleContainer,
                    safeAreaInsets: {
                        top: 0,
                    },
                }}
            >
                <Settings.Screen
                    name={name}
                    component={children}
                    options={{
                        headerTitleStyle: styles.headerTitle,
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => Navigation.pop()}
                            >
                                <Image style={styles.backIcon} source={getAssetId("back-icon")} />
                            </TouchableOpacity>
                        ),
                        ...NavigationStack.TransitionPresets.BottomSheetAndroid
                    }}
                />
            </Settings.Navigator>
        </NavigationNative.NavigationContainer>
    );
}

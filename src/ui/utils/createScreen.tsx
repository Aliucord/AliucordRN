import { DiscordNavigator, Navigation, React } from "../../metro";

/**
 * Most options props of Stack.Screen are valid (besides animation). Refer https://reactnavigation.org/docs/stack-navigator/#options
 */
type ScreenOptions = {
    title: string;
    render: () => JSX.Element;
    headerTitle?: () => JSX.Element;
    headerLeft?: () => JSX.Element;
    [key: string]: any;
};

/**
 * @param screenOptions Options to pass to the navigator, usually to customize the header.
 * @returns A stack navigator with the single page from the first argument
 */
export default function createScreen(screenOptions: ScreenOptions): () => JSX.Element {
    const { default: Navigator, getRenderCloseButton } = DiscordNavigator;

    // eslint-disable-next-line react/display-name
    return () => (
        <Navigator
            initialRouteName="Page"
            screens={{
                Page: {
                    headerLeft: getRenderCloseButton(() => Navigation.pop()),
                    ...screenOptions,
                }
            }}
        />
    );
}

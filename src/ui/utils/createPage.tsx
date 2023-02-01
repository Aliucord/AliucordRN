import { DiscordNavigator, Navigation, React } from "../../metro";

/**
 * @param render Page subview to render
 * @param options Options to pass to the navigator, usually to customize the header. Most props for Stack.Screen are valid (besides animation). Refer https://reactnavigation.org/docs/stack-navigator/#options
 * @returns A stack navigator with the single page from the first argument
 */
export default function createPage(render: () => JSX.Element, options: { [key: string]: any; }): () => JSX.Element {
    const { default: Navigator, getRenderCloseButton } = DiscordNavigator;

    // eslint-disable-next-line react/display-name
    return () => (<Navigator
        initialRouteName="Page"
        screens={{
            Page: {
                render,
                title: render.name ?? "Aliucord Page",
                headerLeft: getRenderCloseButton(() => Navigation.pop()),
                ...options,
            }
        }}
    />);
}


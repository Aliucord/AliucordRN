import { Constants, getByName, getByProps, Styles } from "../../metro";

export const Forms = getByProps("FormSection");
export const General = getByProps("Button", "Text", "View") as typeof import("react-native");
export const Search = getByName("StaticSearchBarContainer", { default: false }).default;
export const Button = getByName("Button", { default: false }).default;

export const styles = Styles.createThemedStyleSheet({
    container: {
        flex: 1
    },
    list: {
        paddingVertical: 14,
        paddingHorizontal: 8
    },
    card: {
        borderRadius: 10,
        margin: 5,
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_TERTIARY,
    },
    header: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    bodyCard: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_SECONDARY,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    bodyText: {
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 18,
        textAlignVertical: "top"
    },
    actions: {
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 16,
        paddingRight: 12,
        paddingBottom: 10
    },
    iconsContainer: {
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    icons: {
        width: 24,
        height: 24,
        marginHorizontal: 4,
        tintColor: Styles.ThemeColorMap.INTERACTIVE_NORMAL
    },
    headerText: {
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontSize: 18
    },
    link: {
        color: Styles.ThemeColorMap.TEXT_LINK
    },
    emptyPageImage: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "10%"
    },
    emptyPageText: {
        marginTop: 10,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
        fontFamily: Constants.Fonts.PRIMARY_SEMIBOLD,
        textAlign: "center"
    },
    search: {
        margin: 0,
        marginBottom: 0,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15,
        backgroundColor: "none",
        borderBottomWidth: 0,
        background: "none"
    },
    button: {
        height: 34,
        paddingHorizontal: 16,
        marginLeft: 6
    },
    buttonIcon: {
        width: 14,
        height: 14,
        marginRight: 6,
        color: Styles.ThemeColorMap.TEXT_NORMAL
    },
    invalidHeader: {
        flexDirection: "column",
        flexWrap: "wrap"
    },
    invalidInfoText: {
        color: Styles.ThemeColorMap.TEXT_MUTED,
        fontSize: 12,
        fontWeight: "400"
    },
    warningText: {
        color: Styles.ThemeColorMap.TEXT_WARNING,
        fontFamily: Constants.Fonts.PRIMARY_NORMAL,
        fontSize: 12,
        paddingTop: 5
    },
});

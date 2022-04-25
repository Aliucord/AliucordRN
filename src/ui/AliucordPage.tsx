import { React, ReactNative as RN } from "../metro";

// TODO - Can we yoink Discords stylesheets somehow?
//        Perhaps they are stored in some module?
//        Or patch StyleSheet.create?
//
// If not: Make some stylesheets with Discords colours
export const styles = RN.StyleSheet.create({
    text: {
        color: "white"
    }
});

export default function AliucordPage() {
    return (
        <RN.Text style={styles.text}>Aliucord Moment</ RN.Text>
    );
}

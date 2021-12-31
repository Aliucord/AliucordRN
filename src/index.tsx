import setUpReactDevTools from "./devtools/setUpReactDevTools";
import { getModule } from "./metro";

try {
    setUpReactDevTools();

    const headerModule = getModule(m => m.Header, false);
    const headerComponent = headerModule.exports.Header;
    headerModule.exports = {
        ...headerModule.exports, Header: () => {
            const header = headerComponent();
            header.props.children.find(x => x.type.displayName === "Text").props.children = ["Welcome to Aliuwucord!"];
            return header;
        }
    };
} catch (error) {
    console.error(error);
}
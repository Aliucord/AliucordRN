import { getByName, getByProps, getModule } from "../metro";

export const Forms = getByProps("FormSection");
export const General = getByProps("Button", "Text", "View") as typeof import("react-native");
export const Search = getModule(m => m.name === "StaticSearchBarContainer");
export const Button = getByName("Button", { default: false }).default;

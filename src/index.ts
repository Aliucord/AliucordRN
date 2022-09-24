import * as swcHelpers from "@swc/helpers";
import * as Aliucord from "./Aliucord";

export * from "./Aliucord";
export * as api from "./api";
export * as entities from "./entities";
export * as metro from "./metro";
export * as native from "./native";
export * as utils from "./utils";

window.swcHelpers = swcHelpers;
window.Aliucord = Aliucord;

Aliucord.load();

import * as swcHelpers from "@swc/helpers";
import * as Aliucord from "./Aliucord";

export * from "./Aliucord";
export * as api from "./api";
export * as entities from "./entities";
export * as metro from "./metro";
export * as native from "./native";
export * as ui from "./ui";
export * as utils from "./utils";

window.swcHelpers = swcHelpers;
window.Aliucord = Aliucord;

// setImmediate is necessary here as otherwise this function is called before
// the bundle returned, meaning global.aliucord won't be ready.
setImmediate(Aliucord.load);

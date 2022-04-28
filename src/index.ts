import * as Aliucord from "./Aliucord";

export * as api from "./api";
export * as entities from "./entities";
export * as metro from "./metro";
export * as native from "./native";
export * as utils from "./utils";

window.Aliucord = Aliucord;
Aliucord.load();

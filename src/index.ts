import * as swcHelpers from "@swc/helpers";
import { Aliucord } from "./Aliucord";

window.swcHelpers = swcHelpers;

export const aliucord = window.Aliucord = new Aliucord();
aliucord.load().catch(console.error);

export * from "./Aliucord";
export * as api from "./api";
export * as entities from "./entities";
export * as metro from "./metro";
export * as native from "./native";
export * as utils from "./utils";


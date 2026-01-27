import routeArray from "./route";
import middleware from "../user/index";

export default (prefix) => middleware.routeArray(routeArray, prefix);
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/searchEasy.jsx"), route("/original", "routes/search.jsx")] satisfies RouteConfig;

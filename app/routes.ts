import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/search.jsx"), route("/easy", "routes/searchEasy.jsx")] satisfies RouteConfig;

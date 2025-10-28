import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/boards", "routes/boards.tsx"),
  route("/boards/request", "routes/boards-request.tsx"),
  // Dynamic board pages (must come after static /boards routes)
  route("/boards/:name", "routes/board.tsx"),
] satisfies RouteConfig;

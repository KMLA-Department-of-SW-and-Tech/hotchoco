// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.jsx"),       // GET /
  route("post", "routes/post.jsx") // GET /post
] satisfies RouteConfig;

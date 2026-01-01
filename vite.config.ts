import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^~\//,
        replacement: `${path.resolve(__dirname, "app")}/`,
      },
    ],
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});

import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^~\//,
        replacement: `${path.resolve(__dirname, "app")}/`,
      },
    ],
  },
  plugins: [react()],
});

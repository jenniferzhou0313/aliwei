import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@aliwei/domain": path.resolve(__dirname, "../../packages/domain/src"),
      "@aliwei/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});

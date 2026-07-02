import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@/components", replacement: path.resolve(__dirname, "./components") },
      { find: "@/stores", replacement: path.resolve(__dirname, "./stores") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./hooks") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});

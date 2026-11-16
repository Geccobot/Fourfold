import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["Packages/**/*.test.ts", "apps/**/*.test.{ts,tsx}"],
    setupFiles: ["./apps/web/src/test/setup.ts"],
  },
});

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/e2e/**", // reserved for future integration tests
    ],
    globals: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "src/lib/sm2.ts",
        "src/lib/tier.ts",
        "src/lib/bible.ts",
        "src/lib/xp.ts",
        "src/lib/achievements.ts",
        "src/lib/charles/prompts.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});

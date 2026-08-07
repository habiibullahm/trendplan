import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "src/**/components/**/*.{ts,tsx}",
      "src/features/**/components/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/features/auth/lib/prepare-avatar-upload",
              message:
                "prepare-avatar-upload uses sharp (Node-only). Import only from Server Actions.",
            },
            {
              name: "sharp",
              message:
                "Do not import sharp from Client Components — it pulls Node builtins (child_process).",
            },
          ],
          patterns: [
            {
              group: ["**/prepare-avatar-upload", "**/prepare-avatar-upload.*"],
              message:
                "prepare-avatar-upload uses sharp (Node-only). Import only from Server Actions.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;

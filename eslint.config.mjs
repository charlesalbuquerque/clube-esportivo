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
    // Runtime do protótipo de design (design-handoff/) — não é código do
    // app, é o suporte do arquivo .dc.html (ver design-handoff/README.md).
    "design-handoff/**",
  ]),
]);

export default eslintConfig;

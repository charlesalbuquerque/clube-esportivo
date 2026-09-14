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
    // Runtime do protótipo de design (design_handoff/) — não é código do
    // app, é o suporte dos arquivos .dc.html/.html (ver design_handoff/README.md).
    "design_handoff/**",
  ]),
]);

export default eslintConfig;

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import security from 'eslint-plugin-security';


export default [
  { 
    languageOptions: 
    { 
      globals: globals.browser 
    } 
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    ignores: [
      "node_modules",
      "dist",
      "coverage",
      "jest.config.ts",
      "*.spec.ts",
      "src/*/*/*.spec.ts",
      "src/*/*/*/*.spec.ts",
      ".eslintrc.js",
      "tsconfig.json"
    ] 
  }
];
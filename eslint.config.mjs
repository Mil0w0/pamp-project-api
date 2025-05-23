import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,tsx}"], languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended,
];

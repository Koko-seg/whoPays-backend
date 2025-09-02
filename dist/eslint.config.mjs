"use strict";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node, // ✅ process, require, exports-г зөвшөөрнө
            },
        },
        ignores: [
            "dist/**", // ✅ build хийгдсэн хавтсыг lint хийхгүй
            "node_modules/**",
        ],
        rules: {
            "@typescript-eslint/no-require-imports": "off", // ✅ require() зөвшөөрнө
        },
    },
    ...tseslint.configs.recommended,
]);

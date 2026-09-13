import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import robloxTs from "eslint-plugin-roblox-ts";
import prettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(
	{
		ignores: ["out/**", "include/**", "node_modules/**"],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.{ts,tsx}"],
		plugins: {
			"roblox-ts": robloxTs,
		},
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...robloxTs.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-empty-object-type": "off",
		},
	},
	prettier,
);

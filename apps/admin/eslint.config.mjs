import js from "@eslint/js";

export default [
  {
    ignores: [".next", "node_modules"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        React: "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];

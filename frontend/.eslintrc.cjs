module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "react-hooks"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/refs": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
  },
  overrides: [
    {
      files: ["**/*.test.{js,jsx}", "**/__tests__/**/*.{js,jsx}"],
      env: {
        jest: true,
      },
    },
  ],
};

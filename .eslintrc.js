module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
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
  plugins: ["react-hooks"],
  extends: ["plugin:storybook/recommended"],
  rules: {
    "storybook/no-renderer-packages": "off",
  },
}

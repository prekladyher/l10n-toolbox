module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    semi: ["error", "always"],
    indent: ["error", 2, { "SwitchCase": 1 }],
    "no-trailing-spaces": "error"
  },
  overrides: [
    {
      files: "*.js",
      rules: {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ]
};

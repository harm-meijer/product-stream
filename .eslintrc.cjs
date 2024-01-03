// @ts-check

/** @type {import('eslint').ESLint.ConfigData} */
const configuration = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  ignorePatterns: ["dist/**"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", ignoreRestSiblings: true },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "no-undef": "error",
    "no-const-assign": "error",
    "nonblock-statement-body-position": "off",
    "comma-dangle": "off",
    "class-methods-use-this": "off",
    "max-len": [2, 150],
    "no-restricted-syntax": ["error", "WithStatement"],
    "no-param-reassign": 0,
    "no-plusplus": 0,
    "no-unused-expressions": "off",
    "operator-linebreak": "off",
    "no-await-in-loop": "off",
    "prefer-destructuring": "off",
    "no-use-before-define": "off",
    "no-underscore-dangle": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "no-return-await": "off",
    "no-constant-condition": ["error", { checkLoops: false }],
  },
};

module.exports = configuration;

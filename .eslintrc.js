module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "semi": [
      "error",
      "always"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "comma-dangle": [
      "error",
      "always-multiline"
    ],
    "curly": [
      "error",
      "all"
    ],
    "prefer-const": [
      "error",
      {
        "destructuring": "any",
        "ignoreReadBeforeAssign": false
      }
    ]
  }
};

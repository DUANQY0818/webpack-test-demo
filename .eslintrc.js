// eslint-disable-next-line no-undef
module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-undef': 'error',
    'no-console': 'off',
    'no-octal': 'off',
  },
};

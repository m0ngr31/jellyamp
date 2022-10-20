module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-empty': 'off',
    'max-len': ["error", { "code": 140 }],
    'arrow-parens': 'off',
    'no-constant-condition': 'off',
    'object-curly-spacing': 'off',
    'lines-between-class-members': 'off',
    'class-methods-use-this': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};

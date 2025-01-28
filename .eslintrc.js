module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        browser: true
    },
    extends: [
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 2021
    },
    rules: {
        semi: [2, 'always'],
        indent: 'off'
    }
};

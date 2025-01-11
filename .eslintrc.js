module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
        curly: ['error', 'all'],
        'prefer-const': [
            'error',
            {
                destructuring: 'any',
                ignoreReadBeforeAssign: false,
            },
        ],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                args: 'after-used',
                ignoreRestSiblings: true,
            },
        ],
    },
};

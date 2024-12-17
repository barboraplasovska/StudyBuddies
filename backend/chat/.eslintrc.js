module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],

        "semi": "off",
        "@typescript-eslint/semi": ["error"],

        "require-await": "off",
        "@typescript-eslint/require-await": "error",

        "no-console": "off",
        "no-restricted-syntax": [
            "error",
            {
                "selector": "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error)$/]",
                "message": "Unexpected property on console object was called"
            }
        ],

        "sort-imports": ["error", {
            "ignoreCase": false,
            "ignoreDeclarationSort": false,
            "ignoreMemberSort": false,
            "memberSyntaxSortOrder": ["none", "all", "single", "multiple"],
            "allowSeparatedGroups": false
        }],

        "no-duplicate-imports": "error",
        "no-await-in-loop": "error",
        "no-irregular-whitespace": "error",
        "no-self-assign": ["error", {"props": true}],
        "no-self-compare": "error",
        "no-unreachable": "error",
        "no-unreachable-loop": "error",
        "no-use-before-define": "error",
        "no-else-return": ["error", {allowElseIf: false}],
        "no-empty": "error",
        "no-empty-function": "error",
        "no-useless-catch": "error"
    },
    env: {
        node: true,
        es6: true
    }
};

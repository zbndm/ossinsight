/* eslint-disable quote-props */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
  ],
  overrides: [
    {
      files: ['**/*.js', '**/*.mjs', '**/*.jsx'],
      rules: {
        'comma-dangle': ['error', 'only-multiline'],
        'semi': ['error', 'always'],
      }
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
      rules: {
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/member-delimiter-style': ['error', {
          'multiline': {
            'delimiter': 'semi',
            'requireLast': true
          },
          'singleline': {
            'delimiter': 'comma',
            'requireLast': false
          },
          'multilineDetection': 'brackets'
        }],
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            'checksVoidReturn': false
          }
        ],
        'no-void': 'off'
      }
    },
    {
      files: ['**/*.jsx', '**/*.tsx'],
      rules: {
        'react/display-name': ['warn'],
        'react/prop-types': ['error', {
          skipUndeclared: true,
        }],
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './tsconfig.json',
      './test/tsconfig.json'
    ],
  },
  plugins: [
    'react',
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
  }
};

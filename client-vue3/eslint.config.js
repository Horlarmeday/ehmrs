import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'vite.config.js', 'vite.config.d.ts', 'vitest.config.js', 'vitest.config.d.ts'] },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    rules: {
      // Project rule: no `any` and no direct type casting anywhere in src.
      // Use precise types or runtime-checked guards (see contract/types.ts
      // for the single sanctioned boundary conversion). Escape hatch: a
      // targeted eslint-disable with written justification.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression:not([typeAnnotation.type="TSTypeReference"][typeAnnotation.typeName.name="const"])',
          message: 'Direct type casting is banned — use precise types or runtime-checked guards (targeted eslint-disable with justification only).',
        },
        {
          selector: 'TSTypeAssertion',
          message: 'Angle-bracket type casting is banned — use precise types or runtime-checked guards (targeted eslint-disable with justification only).',
        },
      ],
    },
  },
  {
    files: ['*.config.js', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': 'off',
    },
  },
)

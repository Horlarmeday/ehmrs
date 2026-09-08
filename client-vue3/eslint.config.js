import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

const noComments = {
  meta: { type: 'problem', schema: [], messages: { unexpected: 'Comment is not allowed — code must be self-explanatory; prefix with `! ` only when genuinely necessary (kept to the nearest minimum).' } },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const isSectionMarker = (text) => text.length <= 48 && text === text.toUpperCase()
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const text = comment.value.trim()
          if (text.startsWith('eslint')) continue
          if (text.startsWith('!')) continue
          if (comment.type === 'Shebang' || text.startsWith('/')) continue
          if (comment.type === 'Line' && isSectionMarker(text)) continue
          context.report({ node: comment, messageId: 'unexpected' })
        }
      },
    }
  },
}

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'vite.config.js', 'vite.config.d.ts', 'vitest.config.js', 'vitest.config.d.ts'] },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    plugins: { local: { rules: { 'no-comments': noComments } } },
    rules: {
      'vue/multi-word-component-names': 'off',
      'local/no-comments': 'error',
    },
  },
  {
    rules: {
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
      'local/no-comments': 'off',
    },
  },
)

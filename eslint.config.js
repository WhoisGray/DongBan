import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: { globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', crypto: 'readonly', URL: 'readonly', Blob: 'readonly', FileReader: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' } },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off'
    }
  }
]

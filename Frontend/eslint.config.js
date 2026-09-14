import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // These modules deliberately export shared helpers and constants next to
    // their components (the design-system primitives, the auth hook, the
    // role → home-route map). Fast refresh still works for the app itself.
    files: [
      'src/components/ui.jsx',
      'src/components/ProtectedRoute.jsx',
      'src/context/AuthContext.jsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])

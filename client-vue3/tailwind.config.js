/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'
import { tokens } from './tailwind.tokens'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      ...tokens,
      screens: {
        touch: { raw: '(pointer: coarse)' },
      },
    },
  },
  plugins: [tailwindcssAnimate],
  corePlugins: {
    preflight: true,
  },
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue-50': '#f0f9ff',
        'teal-50': '#F0FDFA',
        'teal-100': '#C6F7E2',
        'teal-200': '#99F0C2',
        'teal-300': '#66E8A2',
        'teal-400': '#33E382',
        'teal-500': '#14B8A6',
        'teal-600': '#0F9C8A',
        'teal-700': '#0A7A6E',
        'teal-800': '#065A52',
        'teal-900': '#034A46',
        'teal-950': '#002C2A',
      },
    },
  },
  plugins: [],
}
export default config
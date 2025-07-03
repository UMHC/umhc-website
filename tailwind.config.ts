import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'umhc-green': '#1C5713',
        'stealth-green': '#2E4E39',
        'earth-orange': '#B15539',
        'slate-grey': '#494949',
        'deep-black': '#000000',
        'whellow': '#FFFCF7',
        'cream-white': '#FFFEFB',
      },
    },
  },
  plugins: [],
}
export default config
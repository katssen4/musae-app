import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      colors: {
        musae: {
          ink: '#1a1a2e',
          parchment: '#f5f0e8',
          gold: '#c9a84c',
          sage: '#6b7f5e',
        },
      },
      fontSize: {
        base: ['16px', '1.6'],
      },
    },
  },
  plugins: [],
}

export default config

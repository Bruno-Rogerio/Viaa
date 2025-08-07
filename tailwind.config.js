/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdfcfb',
          100: '#faf8f6',
          200: '#f5f0ea',
          300: '#ede4d8',
          400: '#e2d1c0',
          500: '#d4bca2',
          600: '#c4a584',
          700: '#a6896b',
          800: '#8b7156',
          900: '#735d47',
        },
      },
      animation: {
        'gradient': 'gradient 8s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5fb',
          100: '#f3e8f5',
          200: '#e8d5ec',
          300: '#d8b4de',
          400: '#c592cc',
          500: '#b081b7', // Main brand color
          600: '#9866a0',
          700: '#7e5386',
          800: '#66446e',
          900: '#55395a',
        },
      },
    },
  },
  plugins: [],
};

const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e5f5',
          200: '#e1bee7',
          300: '#ce93d8',
          400: '#ba68c8',
          500: '#b081b7',
          600: '#9c27b0',
          700: '#7b1fa2',
          800: '#6a1b9a',
          900: '#4a148c',
          DEFAULT: '#b081b7',
          foreground: '#ffffff',
        },
        neutral: {
          light: '#f5f5f5',
          DEFAULT: '#616161',
          dark: '#212121',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

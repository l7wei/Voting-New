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
          DEFAULT: '#b081b7', // Main brand color
          light: '#f3e5f5',   // Light purple for backgrounds/cards
        },
        neutral: {
          light: '#f5f5f5',   // Light gray background
          DEFAULT: '#616161', // Dark gray for text
          dark: '#212121',    // Near-black for titles
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

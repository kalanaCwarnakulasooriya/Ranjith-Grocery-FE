/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'grocery-green': '#22c55e',
        'grocery-green-dark': '#16a34a',
        'grocery-orange': '#f97316',
        'grocery-orange-dark': '#ea580c',
      }
    },
  },
  plugins: [],
}

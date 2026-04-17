/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tiffany-green': '#0ABAB5',
        'tiffany-light': '#81D8D0',
        'tiffany-soft': 'rgba(10, 186, 181, 0.1)',
        'medical-white': '#F8FAFA',
        'medical-gray': '#E2E8F0',
        'text-primary': '#1A3A3A',
        'text-secondary': '#4A5568',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

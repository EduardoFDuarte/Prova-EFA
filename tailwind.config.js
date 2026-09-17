/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        efa: {
          blue: '#0a0a0a',
          gold: '#e8b84b',
          light: '#fdf6e3',
        },
      },
    },
  },
  plugins: [],
}

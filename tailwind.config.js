/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        efa: {
          blue: '#0f0f0f',
          gold: '#c9a84c',
          light: '#f5f0e8',
        },
      },
    },
  },
  plugins: [],
}

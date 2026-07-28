/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        efa: {
          blue: '#1a3a5c',
          gold: '#c9a84c',
          light: '#f0f4f8',
        },
      },
    },
  },
  plugins: [],
}

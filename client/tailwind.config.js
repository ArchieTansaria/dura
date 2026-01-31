/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // Near black
        surface: '#121212',
        subtle: '#27272a',
        primary: '#f4f4f5', // Zinc 100
        secondary: '#a1a1aa', // Zinc 400
        accent: '#f59e0b', // Amber 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

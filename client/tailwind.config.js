/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dura-bg': '#0a0a0a',
        'dura-bg-light': '#1a1a1a',
        'dura-accent': '#00d4ff',
        'dura-accent-alt': '#8b5cf6',
        'dura-text': '#ffffff',
        'dura-text-secondary': '#a0a0a0',
        'dura-high': '#ef4444',
        'dura-medium': '#f59e0b',
        'dura-low': '#10b981',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}

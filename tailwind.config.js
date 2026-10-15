/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        neon: {
          300: '#d7fa65',
          400: '#c4f042',
          500: '#b4eb28',
          600: '#9cd119',
        },
        charcoal: {
          950: '#0b0d11',
          900: '#111317',
          850: '#161920',
          800: '#1b1e26',
          750: '#212530',
          700: '#282d3b',
          600: '#383e50',
        },
        navy: {
          800: '#0f172a',
          900: '#0b0f19',
          950: '#060911',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(196, 240, 66, 0.35)',
        'neon-lg': '0 0 35px rgba(196, 240, 66, 0.45)',
        'emerald-glow': '0 0 25px rgba(34, 197, 94, 0.25)',
      },
    },
  },
  plugins: [],
}

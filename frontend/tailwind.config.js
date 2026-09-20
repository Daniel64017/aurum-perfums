/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aurum: {
          dark: '#08080C',
          card: '#12121A',
          surface: '#1A1A24',
          border: '#2A2A38',
          gold: {
            light: '#F8E9B0',
            DEFAULT: '#D4AF37',
            dark: '#AA8518',
            glow: 'rgba(212, 175, 55, 0.15)'
          },
          accent: '#E2C044',
          gray: {
            light: '#A0A0B0',
            DEFAULT: '#606070',
            dark: '#2A2A35'
          }
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F8E9B0 0%, #D4AF37 50%, #AA8518 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0D0D14 0%, #050508 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)'
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 10px 30px -5px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}

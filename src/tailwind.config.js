/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'bentin-pink': '#e91e63',
        'bentin-blue': '#2196f3',
        'bentin-green': '#4caf50',
        'bentin-orange': '#ff6b35',
        'bentin-mint': '#66bb6a',
        'bentin-light-blue': '#42a5f5',
        'bentin-lime': '#9ccc65',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-3px)' }
        }
      },
      backgroundImage: {
        'bentin-gradient': 'linear-gradient(135deg, #e91e63 0%, #2196f3 50%, #4caf50 100%)',
        'bentin-gradient-subtle': 'linear-gradient(135deg, #e91e6310 0%, #2196f310 50%, #4caf5010 100%)'
      },
      boxShadow: {
        'bentin': '0 4px 6px -1px rgba(233, 30, 99, 0.1), 0 2px 4px -1px rgba(233, 30, 99, 0.06)',
        'bentin-lg': '0 10px 15px -3px rgba(233, 30, 99, 0.1), 0 4px 6px -2px rgba(233, 30, 99, 0.05)'
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
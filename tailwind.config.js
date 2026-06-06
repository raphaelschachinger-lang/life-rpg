/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'navy-900': '#050d1a',
        'navy-800': '#0a1628',
        'navy-700': '#0f1f35',
        'navy-600': '#1a2d45',
        'rpg-blue':   '#388BDC',
        'rpg-gold':   '#E4A94B',
        'rpg-green':  '#3DC98A',
        'rpg-purple': '#8B6FCA',
        'rpg-red':    '#E05C5C',
        'rpg-teal':   '#2EC4B6',
        'rpg-text':   '#C8D8EC',
        'rpg-muted':  '#6B8BAD',
        'rpg-muted2': '#4E6A88',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'DM Mono', 'monospace'],
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-gold': 'pulseGold 0.6s ease 3',
        'count-up': 'countUp 1.2s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(228,169,75,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(228,169,75,0.5)' },
        },
      },
    },
  },
  plugins: [],
}

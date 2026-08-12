/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-start': '#0e2b2e',
        'bg-mid':   '#08191b',
        'bg-end':   '#051012',
        'rpg-cyan':     '#4fe8d1',
        'rpg-cyan-dim': '#1f6e66',
        'rpg-amber':    '#ffb454',
        'rpg-text':     '#d8f3ee',
        'rpg-muted':    '#6fa39a',
      },
      fontFamily: {
        mono: ['Courier New', 'ui-monospace', 'monospace'],
        sans: ['Courier New', 'ui-monospace', 'monospace'],
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,180,84,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255,180,84,0.4)' },
        },
      },
    },
  },
  plugins: [],
}

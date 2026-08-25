/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'rpg-accent':      '#0A6CFF',
        'rpg-accent-soft': 'rgba(10,108,255,0.12)',
        'rpg-negative':    '#E5484D',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
        // No monospace anywhere in the new theme — font-mono utility (used across
        // screens for numeric values) now resolves to the same system font, with
        // tabular-nums applied separately via the `.mono` class where alignment matters.
        mono: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
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

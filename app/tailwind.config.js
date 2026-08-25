/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#004FF1',
          dark: '#0038B8',
          light: '#EAF0FE',
          pale: '#C3D6FD',
        },
        ink: {
          DEFAULT: '#0E1220',
          mid: '#363E52',
          muted: '#6B7385',
        },
        surface: {
          DEFAULT: '#F7F9FE',
          sand: '#F1F3F9',
        },
      },
      fontFamily: {
        heading: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 2px 12px rgba(0,79,241,0.10)',
        'brand-md': '0 4px 20px rgba(0,79,241,0.12)',
        'brand-lg': '0 8px 40px rgba(0,79,241,0.18)',
        'brand-xl': '0 16px 60px rgba(0,79,241,0.22)',
        'card': '0 2px 16px rgba(14,18,32,0.06)',
        'card-hover': '0 8px 32px rgba(14,18,32,0.10)',
      },
      animation: {
        'blink': 'blink 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'flow-line': 'flowLine 1.2s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flowLine: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '18px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        'bg-glass': 'rgba(18, 6, 6, 0.6)',
        'accent-red': '#C0272D',
        'accent-gold': '#C9A84C',
        'text-primary': '#F0EAD6',
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'imperial-gradient': 'radial-gradient(ellipse at center, rgba(192,39,45,0.15) 0%, transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #C9A84C 100%)',
      },
      animation: {
        'aura-pulse': 'auraPulse 3s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'line-extend': 'lineExtend 1.5s ease-out forwards',
      },
      keyframes: {
        auraPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        lineExtend: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config

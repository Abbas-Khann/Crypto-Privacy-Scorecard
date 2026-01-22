import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vaporwave/Outrun palette
        background: '#090014',
        foreground: '#E0E0E0',
        card: 'rgba(26, 16, 60, 0.8)',
        'card-solid': '#1a103c',
        border: '#2D1B4E',
        'border-active': '#00FFFF',
        // Primary neon colors
        magenta: '#FF00FF',
        cyan: '#00FFFF',
        orange: '#FF9900',
        // Semantic aliases
        primary: '#FF00FF',
        secondary: '#00FFFF',
        accent: '#FF9900',
      },
      fontFamily: {
        heading: ['var(--font-orbitron)', 'sans-serif'],
        mono: ['var(--font-share-tech-mono)', 'monospace'],
      },
      boxShadow: {
        'neon-magenta': '0 0 10px #FF00FF',
        'neon-magenta-lg': '0 0 20px #FF00FF',
        'neon-cyan': '0 0 10px #00FFFF',
        'neon-cyan-lg': '0 0 20px #00FFFF',
        'neon-cyan-xl': '0 0 50px rgba(0,255,255,0.2)',
        glow: '0 0 20px rgba(0,255,255,0.2)',
      },
      dropShadow: {
        'text-glow': '0 0 10px rgba(255,255,255,0.5)',
        'text-magenta': '0 0 30px rgba(255,0,255,0.6)',
        'text-cyan': '0 0 5px rgba(0,255,255,0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config

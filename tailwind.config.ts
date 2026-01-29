import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a24',
        },
        foreground: {
          DEFAULT: '#fafafa',
          muted: '#a1a1aa',
        },
        primary: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
        },
        success: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        border: {
          DEFAULT: '#27272a',
          light: '#3f3f46',
        },
        card: {
          DEFAULT: '#18181b',
          hover: '#1f1f23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;


import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-pt-sans)', 'sans-serif'],
        headline: ['var(--font-playfair-display)', 'serif'],
        code: ['var(--font-source-code-pro)', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // İnce ayar renkleri
        'blockquote-bg': 'hsl(var(--blockquote-bg))',
        'blockquote-border': 'hsl(var(--blockquote-border))',
        'blockquote-text': 'hsl(var(--blockquote-text))',
        'code-bg': 'hsl(var(--code-bg))',
        'code-text': 'hsl(var(--code-text))',
        'separator-color': 'hsl(var(--separator-color))',
        'toast-bg': 'hsl(var(--toast-bg))',
        'toast-text': 'hsl(var(--toast-text))',
        'toast-border': 'hsl(var(--toast-border))',
        'link-text': 'hsl(var(--link-text))',
        'link-hover-text': 'hsl(var(--link-hover-text))',
        'button-primary-bg': 'hsl(var(--button-primary-bg))',
        'button-primary-text': 'hsl(var(--button-primary-text))',
        'button-primary-hover-bg': 'hsl(var(--button-primary-hover-bg))',
        'button-secondary-bg': 'hsl(var(--button-secondary-bg))',
        'button-secondary-text': 'hsl(var(--button-secondary-text))',
        'button-secondary-hover-bg': 'hsl(var(--button-secondary-hover-bg))',
        'input-bg': 'hsl(var(--input-bg))',
        'input-border': 'hsl(var(--input-border))',
        'input-text': 'hsl(var(--input-text))',
        'input-focus-ring': 'hsl(var(--input-focus-ring))',
        'card-title-text': 'hsl(var(--card-title-text))',
        'card-description-text': 'hsl(var(--card-description-text))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

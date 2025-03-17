
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				emerald: {
					light: '#10b981',
					DEFAULT: '#059669',
					dark: '#047857'
				},
				slate: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617'
				},
				apple: {
					dark: '#0a0a0a',
					DEFAULT: '#121212',
					light: '#1c1c1e'
				},
				// New colors for ocean gold dust theme
				ocean: {
					light: '#33C3F0',
					DEFAULT: '#0EA5E9',
					dark: '#0284C7'
				},
				gold: {
					light: '#FEF7CD',
					DEFAULT: '#FEC6A1',
					dark: '#FDA97E'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['SF Pro Display', 'system-ui', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-delayed': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'50%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.97)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)' },
					'100%': { transform: 'translateY(0)' }
				},
				'shimmer': {
					'100%': { transform: 'translateX(100%)' }
				},
				// New animations for ocean gold dust theme
				'ocean-wave': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(5px)' }
				},
				'gold-sparkle': {
					'0%, 100%': { opacity: '0.4' },
					'50%': { opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-delayed': 'fade-in-delayed 0.6s ease-out',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
				'slide-up': 'slide-up 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
				'shimmer': 'shimmer 1.5s infinite',
				// New animations for ocean gold dust theme
				'ocean-wave': 'ocean-wave 6s ease-in-out infinite',
				'gold-sparkle': 'gold-sparkle 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gold-dust-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FEC6A1' fill-opacity='0.15'%3E%3Ccircle cx='12' cy='18' r='1'/%3E%3Ccircle cx='65' cy='42' r='1'/%3E%3Ccircle cx='23' cy='75' r='1'/%3E%3Ccircle cx='90' cy='23' r='1'/%3E%3Ccircle cx='38' cy='39' r='1'/%3E%3Ccircle cx='52' cy='86' r='1'/%3E%3Ccircle cx='81' cy='71' r='1'/%3E%3Ccircle cx='5' cy='51' r='1'/%3E%3Ccircle cx='70' cy='5' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
				'ocean-gradient': 'linear-gradient(to right, rgba(14, 165, 233, 0.15), rgba(51, 195, 240, 0.2))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

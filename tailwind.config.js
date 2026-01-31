/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: "class",
  darkMode: false,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 8px Grid System - Modern spacing scale
      spacing: {
        '0': '0px',
        '0.5': '4px',   // 0.5 * 8
        '1': '8px',     // 1 * 8
        '1.5': '12px',  // 1.5 * 8
        '2': '16px',    // 2 * 8
        '2.5': '20px',  // 2.5 * 8
        '3': '24px',    // 3 * 8
        '3.5': '28px',  // 3.5 * 8
        '4': '32px',    // 4 * 8
        '5': '40px',    // 5 * 8
        '6': '48px',    // 6 * 8
        '7': '56px',    // 7 * 8
        '8': '64px',    // 8 * 8
        '9': '72px',    // 9 * 8
        '10': '80px',   // 10 * 8
        '12': '96px',   // 12 * 8
        '14': '112px',  // 14 * 8
        '16': '128px',  // 16 * 8
        '20': '160px',  // 20 * 8
        '24': '192px',  // 24 * 8
        '32': '256px',  // 32 * 8
        '40': '320px',  // 40 * 8
        '48': '384px',  // 48 * 8
        '56': '448px',  // 56 * 8
        '64': '512px',  // 64 * 8
      },
      // Enhanced shadow system - Added Nest design shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 6px 16px 0 rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 24px 0 rgba(0, 0, 0, 0.12)',
        'xl': '0 16px 40px 0 rgba(0, 0, 0, 0.15)',
        '2xl': '0 24px 56px 0 rgba(0, 0, 0, 0.18)',
        '3xl': '0 32px 64px rgba(0,0,0,0.2)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow-sm': '0 0 8px rgba(66, 175, 87, 0.4)',
        'glow-md': '0 0 16px rgba(66, 175, 87, 0.5)',
        'glow-lg': '0 0 24px rgba(66, 175, 87, 0.6)',
        'card': '0 2px 15px rgba(0,0,0,0.08)',
        'hover': '0 4px 25px rgba(0,0,0,0.12)',
        'product': '0 3px 18px rgba(0,0,0,0.07)',
      },
      // Animation timings - Enhanced with Nest durations
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
        '1500': '1500ms',
      },
      // Animation curves - Enhanced with Nest easing functions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      // Border radius scale - Standardized from Nest
      borderRadius: {
        'none': '0px',
        'sm': '5px',
        'DEFAULT': '10px',
        'md': '15px',
        'lg': '20px',
        'xl': '25px',
        '2xl': '30px',
        '3xl': '40px',
        'pill': '50px',
        'full': '9999px'
      },
      // Typography scale
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '1', letterSpacing: '-0.03em' }],
        '6xl': ['60px', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      colors: {
        // Snappy Fresh Brand Palette - Enhanced with Nest design tokens
        fresh: {
          50: '#f0fdf4',   // NEW - Lightest tint
          100: '#dcfce7',  // NEW - Very light
          200: '#bbf7d0',  // NEW - Light
          300: '#42af57',  // KEEP - chateau-green
          400: '#3d9e4f',  // NEW - Medium
          500: '#42af57',  // KEEP - Main brand green (Matches Nest!)
          600: '#2f8742',  // NEW - Dark
          700: '#215724',  // KEEP - everglade
          800: '#1c352c',  // KEEP - timber-green
          900: '#0f2a0d'   // KEEP - darkest
        },
        // NEW - Semantic Colors from Nest
        success: {
          50: '#f0fdf4',
          500: '#42af57',
          600: '#2f8742'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626'
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb'
        },
        // Red/Coral accent palette
        coral: {
          50: '#fff0ef',
          100: '#ffe0de',
          200: '#f65d53',  // carnation
          300: '#fe2623',  // red-orange
          400: '#c22523',  // cardinal
          500: '#c22523',  // cardinal - Main accent red
          600: '#a11f1d',
          700: '#801917',
          800: '#601311',
          900: '#400d0b'
        },
        // Warning/Sale Red
        sale: {
          500: '#fe2623',  // red-orange
          600: '#c22523'   // cardinal
        },
        // Yellow/Primrose accent
        accent: {
          yellow: '#dfed93',  // primrose
          500: '#9cb32f'      // atlantis
        },
        // Dark colors - Timber Green
        dark: {
          DEFAULT: '#1c352c',  // timber-green
          light: '#215724'     // everglade
        },
        // Gray scale
        gray: {
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057'
        },
        // Primary green (chateau-green)
        primary: {
          500: "#42af57",  // chateau-green
          600: "#215724",  // everglade
          700: "#1c352c"   // timber-green
        },
        // Secondary blue (jordy-blue)
        secondary: {
          500: "#8dc1ed"   // jordy-blue
        },
        // Green accents palette
        accent: {
          700: "#215724",  // everglade
          600: "#42af57",  // chateau-green
          500: "#42af57",  // chateau-green
          300: "#9cb32f",  // atlantis
          100: "#dfed93",  // primrose
          50: "#f5f9e8"
        },
        bgColorOne: {
          500: "#dedddd"
        },
        bgColorTwo: {
          500: "#020202"
        }
      },
      backgroundImage: {
        'side-bar': "url('/assets/test-1.png')",
        'dairy-card': "url('/assets/images/dairy.jpg')",
        'bread-card': "url('/assets/images/bread.jpg')",
        'meat-card': "url('/assets/images/meat-2-min.jpg')",
        'groceries-card': "url('/assets/images/groceries-min.jpg')",
        'chemicals-card': "url('/assets/images/home_chemicals-min.jpg')",
        'innbucks': "url('/assets/images/payment/innbucks.jpg')",
        'ecocash' : "url('/assets/images/payment/ecocash-logo.jpg')",
      },
      fontFamily: {
        titles: ['"titles"', 'sans-serif'],
        quicksand: ['"quicksand"', 'sans-serif'],
        regular: ['"quicksand"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif']
      },
    },
  },
  plugins: [],
}


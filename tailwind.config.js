/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: "class",
  darkMode: false,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Snappy Fresh Brand Palette - New Colors
        fresh: {
          50: '#dfed93',   // primrose - light background
          100: '#d4f5db',
          200: '#9cb32f',  // atlantis - lime accent
          300: '#42af57',  // chateau-green
          400: '#215724',  // everglade - dark green
          500: '#42af57',  // chateau-green - Main brand green
          600: '#215724',  // everglade
          700: '#1c352c',  // timber-green
          800: '#1c352c',
          900: '#0f2a0d'
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


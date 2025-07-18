/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom theme colors using CSS variables
        'theme': {
          'primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        },
        'text-theme': {
          'primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        }
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, box-shadow',
      }
    },
  },
  plugins: [],
};

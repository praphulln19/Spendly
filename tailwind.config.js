/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      colors: {
        apple: {
          bg: '#f5f5f7',
          darkbg: '#000000',
          glass: 'rgba(255, 255, 255, 0.72)',
          darkglass: 'rgba(28, 28, 30, 0.75)',
          border: 'rgba(0, 0, 0, 0.08)',
          darkborder: 'rgba(255, 255, 255, 0.12)',
          blue: '#0071e3',
          gray: '#86868b',
        },
      },
      boxShadow: {
        apple: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'apple-dark': '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
        'glass-glow': '0 0 25px 0 rgba(255, 255, 255, 0.15)',
      },
      backdropBlur: {
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};

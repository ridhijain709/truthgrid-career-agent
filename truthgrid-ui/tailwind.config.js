/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#38bdf8',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        background: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        card: {
          dark: '#1e293b',
          light: '#f8fafc',
        },
        text: {
          dark: '#f1f5f9',
          light: '#1e293b',
        },
      },
    },
  },
  plugins: [],
};
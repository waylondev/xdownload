/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb',
        foreground: '#111827',
        sidebar: '#ffffff',
        'sidebar-foreground': '#111827',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

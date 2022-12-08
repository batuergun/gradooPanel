/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'active-menu': '#394b54',
      'primary': '#070707',

      'backgroundPrimary': '#e1e9ef',
      'backgroundSecondary': '#1b2328;',

      'fontPrimary': '#070707',
      'fontSecondary': '#f3f6f8',

      'cardBackground': '#f2f7f9',
      'dropShadow': '#3d3d3d',
      'activeMenu': '#394b54'
    },
  },
  plugins: [],
}

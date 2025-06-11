/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-white',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'light-blue-green': '#c1f3e9',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
      },
      fontFamily: {
        codec: ['"Codec Pro"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

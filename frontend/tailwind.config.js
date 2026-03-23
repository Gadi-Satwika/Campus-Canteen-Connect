/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#800000",
        slate: "#1e293b",
        cream: "#F8FAFC",
        gold: "#FACC15",
      },
    },
  },
  plugins: [],
}
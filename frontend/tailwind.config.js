/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#7C3AED",
          accent: "#0D9488",
          background: "#F9FAFB",
          neutral: "#374151",
          foreground: "#111827",
        },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f3eddf",
        "cream-soft": "#fbf6ea",
        fairway: "#14281d",
        moss: "#66724b",
        pie: "#c57933",
        crust: "#8a4e25",
        ink: "#161512"
      },
      boxShadow: {
        card: "0 24px 80px rgba(22,21,18,0.18)"
      }
    }
  },
  plugins: []
};

export default config;

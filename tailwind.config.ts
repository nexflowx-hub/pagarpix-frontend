import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#071714",
        mint: "#00e9a6",
        lime: "#b9ff66",
        fog: "#eff8f4"
      },
      boxShadow: {
        glow: "0 0 80px rgba(0, 233, 166, .18)"
      }
    }
  },
  plugins: []
};

export default config;

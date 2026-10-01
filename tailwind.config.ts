import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f3ef",
        paper: "#ffffff",
        ink: "#1d2327",
        muted: "#767d81",
        line: "#e5e1da",
        gold: {
          DEFAULT: "#b78b45",
          accent: "#d2ad76",
          soft: "#f4ead9",
          dark: "#8b652e",
        },
        dark: {
          DEFAULT: "#1f2528",
          card: "#2b3236",
          border: "#ffffff20",
        },
      },
      boxShadow: {
        premium: "0 18px 44px rgba(31,37,40,.09)",
        soft: "0 10px 25px rgba(31,37,40,.05)",
        floating: "0 -12px 28px rgba(31,37,40,.08)",
        modal: "0 -25px 70px rgba(0,0,0,.23)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px",
        "3xl": "30px",
      },
    },
  },
  plugins: [],
};

export default config;

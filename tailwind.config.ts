const { nextui } = require("@nextui-org/react");

import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "15": "repeat(15, minmax(0, 1fr))"
      },
      gridTemplateRows: {
        "20": "repeat(20, minmax(0, 1fr))",
        "30": "repeat(30, minmax(0, 1fr))"
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)"
      }
    }
  },
  darkMode: "class",
  plugins: [nextui()]
} satisfies Config;

import daisyui from 'daisyui';
import { sunset } from 'daisyui/src/theming/themes';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "blue",
          secondary: "teal",
        },
      },
      {
        sunset: {
          ...require("daisyui/src/theming/themes")["sunset"],
          primary: "#a991f7",
          secondary: "#507687",
        },
      },
    ],
    darkTheme: "sunset",
  },
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    ({addComponents}) => {
      addComponents({
        '.btn': {
          '@apply inline-block bg-sky-800 rounded text-white py-2 px-4 hover:bg-emerald-800 ease-out duration-300': {},
        },
        '.mapboxgl-popup .mapboxgl-popup-close-button': {
          '@apply !px-2 text-zinc-900': {},
        },
      })
    }
  ],
}


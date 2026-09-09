/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },

        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          700: "#15803d",
        },

        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          700: "#b45309",
        },

        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          700: "#b91c1c",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        modal: "0 25px 60px rgba(0,0,0,.18)",
        card: "0 2px 8px rgba(0,0,0,.08)",
      },

      borderRadius: {
        modal: "12px",
      },

      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(16px) scale(.98)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },

        fadeOut: {
          "0%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(16px) scale(.98)",
          },
        },

        overlayFade: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },

      animation: {
        modal: "fadeIn .22s ease-out",
        "modal-out": "fadeOut .2s ease-in",
        overlay: "overlayFade .18s ease-out",
      },
    },
  },

  plugins: [],
};

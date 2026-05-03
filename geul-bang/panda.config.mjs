import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  conditions: {
    extend: {
      dark: '[data-theme="dark"] &',
      sepia: '[data-theme="sepia"] &',
    },
  },

  theme: {
    extend: {
      tokens: {
        fonts: {
          reader: { value: '"KoPub Batang", "Noto Serif KR", Georgia, serif' },
          ui: { value: '"Pretendard", "Noto Sans KR", system-ui, sans-serif' },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: {
              value: { base: "#FFFFFF", _dark: "#1a1a1a", _sepia: "#f4ecd8" },
            },
            subtle: {
              value: { base: "#f9f9f9", _dark: "#242424", _sepia: "#ede3c8" },
            },
            card: {
              value: { base: "#ffffff", _dark: "#2a2a2a", _sepia: "#f0e8d0" },
            },
          },
          text: {
            DEFAULT: {
              value: { base: "#1a1a1a", _dark: "#e0e0e0", _sepia: "#3b2f2f" },
            },
            muted: {
              value: { base: "#6b7280", _dark: "#9ca3af", _sepia: "#7a6555" },
            },
          },
          border: {
            DEFAULT: {
              value: { base: "#e5e7eb", _dark: "#374151", _sepia: "#d4c4a8" },
            },
          },
          accent: {
            DEFAULT: {
              value: { base: "#4f46e5", _dark: "#6366f1", _sepia: "#8b4513" },
            },
          },
        },
      },
    },
  },

  outdir: "styled-system",
});

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
              value: { base: "#F4F6FB", _dark: "#1a1a1a", _sepia: "#f4ecd8" },
            },
            subtle: {
              value: { base: "#eef0f6", _dark: "#242424", _sepia: "#ede3c8" },
            },
            card: {
              value: { base: "#ffffff", _dark: "#2a2a2a", _sepia: "#f0e8d0" },
            },
            overlay: {
              value: { base: "rgba(0,0,0,0.48)", _dark: "rgba(0,0,0,0.68)", _sepia: "rgba(0,0,0,0.48)" },
            },
          },
          text: {
            DEFAULT: {
              value: { base: "#1a1a2e", _dark: "#e0e0e0", _sepia: "#3b2f2f" },
            },
            muted: {
              value: { base: "#6b7280", _dark: "#9ca3af", _sepia: "#7a6555" },
            },
            disabled: {
              value: { base: "#d1d5db", _dark: "#4b5563", _sepia: "#c4b5a0" },
            },
            inverse: {
              value: { base: "#ffffff", _dark: "#1a1a1a", _sepia: "#f4ecd8" },
            },
          },
          border: {
            DEFAULT: {
              value: { base: "#e2e5ee", _dark: "#374151", _sepia: "#d4c4a8" },
            },
            strong: {
              value: { base: "#9ca3af", _dark: "#6b7280", _sepia: "#b8a898" },
            },
          },
          accent: {
            DEFAULT: {
              value: { base: "#3B5BDB", _dark: "#6366f1", _sepia: "#8b4513" },
            },
            hover: {
              value: { base: "#3451c7", _dark: "#818cf8", _sepia: "#7a3b10" },
            },
            pressed: {
              value: { base: "#2c44ad", _dark: "#a5b4fc", _sepia: "#6a320e" },
            },
            subtle: {
              value: { base: "#eef2ff", _dark: "#1e1b4b", _sepia: "#f5e9d8" },
            },
            muted: {
              value: { base: "#c7d2fe", _dark: "#312e81", _sepia: "#d4a080" },
            },
          },
          error: {
            DEFAULT: {
              value: { base: "#ef4444", _dark: "#f87171", _sepia: "#c0392b" },
            },
            subtle: {
              value: { base: "#fee2e2", _dark: "#450a0a", _sepia: "#f9d0cc" },
            },
          },
          warning: {
            DEFAULT: {
              value: { base: "#f59e0b", _dark: "#fbbf24", _sepia: "#d97706" },
            },
            subtle: {
              value: { base: "#fef3c7", _dark: "#451a03", _sepia: "#fde68a" },
            },
          },
          success: {
            DEFAULT: {
              value: { base: "#16a34a", _dark: "#4ade80", _sepia: "#15803d" },
            },
            subtle: {
              value: { base: "#dcfce7", _dark: "#052e16", _sepia: "#d1fae5" },
            },
          },
        },
      },
    },
  },

  outdir: "styled-system",
});

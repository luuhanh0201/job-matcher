import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      color:{
          primary: "var(--primary-blue)",
          primaryDark: "var(--blue-dark)",
          purple: "var(--accent-purple)",
          bg: "var(--gray-100)",
          border: "var(--gray-200)",
          muted: "var(--gray-500)",
          text: "var(--gray-900)",
      }
    },
  },
  plugins: [],
};

export default config;
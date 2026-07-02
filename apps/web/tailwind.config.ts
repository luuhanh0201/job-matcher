import type { Config } from 'tailwindcss';

// Ghi chú: Tailwind v4 dùng cấu hình CSS-first (@theme trong globals.css).
// File này không được Tailwind đọc (không có @config trong CSS trỏ vào đây) —
// chỉ giữ lại để một số extension IDE (Tailwind CSS IntelliSense) nhận diện
// đường dẫn content. Đã bỏ khối theme.extend.color cũ (tham chiếu token đã
// xoá) để tránh nhầm lẫn.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
};

export default config;
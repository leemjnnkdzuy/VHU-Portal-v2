import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api-regist': {
        target: 'https://regist_api.vhu.edu.vn/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-regist/, ''),
      },
      '/api-portal': {
        target: 'https://portal_api.vhu.edu.vn/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-portal/, ''),
      },
    },
  },
})
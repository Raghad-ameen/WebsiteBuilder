import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. تحديد المنفذ لضمان عدم تغيره
    port: 5173, 
    // 2. إعداد البروكسي لحل مشاكل الـ CORS عند الاتصال بالباك اند
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // افترضنا أن الباك اند يعمل على هذا الرابط
        changeOrigin: true,
        secure: false,
      },
    },
    // 3. السماح لمتصفح كروم بالوصول الآمن أثناء التطوير
    cors: true,
  },
})
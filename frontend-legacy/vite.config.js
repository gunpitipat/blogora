import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default ({ mode }) => {
  const env =  loadEnv(mode, process.cwd(), "")

  return defineConfig({
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_USE_LOCAL_BACKEND === "true"
            ? env.VITE_LOCAL_URL
            : env.VITE_RENDER_URL || env.VITE_KOYEB_URL,
          changeOrigin: true,    
        }
      }
    }
  })
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
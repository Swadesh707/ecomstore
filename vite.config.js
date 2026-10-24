import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.API_URL || env.VITE_API_URL || env.VITE_BACKEND_URL || '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_URL': JSON.stringify(apiUrl),
      'import.meta.env.API_URL': JSON.stringify(apiUrl),
    },
    server: {
      port: 5173,
    },
  };
});

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import vueDevTools from 'vite-plugin-vue-devtools';
const env = loadEnv(<string>process.env.NODE_ENV, process.cwd());
const port = parseInt(env.VITE_VUE_PORT) || 5173;
// https://vite.dev/config/

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: port,
    hmr: {
      overlay: false,
    },
  },
  // logLevel: 'warn',
  // define: {
  //   __VUE_PROD_DEVTOOLS__: false,
  // },
});

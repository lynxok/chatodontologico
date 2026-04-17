import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Step finished.
          options.reload();
        },
      },
    ]),
    renderer(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo ls.jpeg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LS Odontología Chat',
        short_name: 'LSChat',
        description: 'Sistema de comunicación interna para LS Odontología',
        theme_color: '#0ABAB5',
        background_color: '#F8FAFA',
        icons: [
          {
            src: 'logo ls.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo ls.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

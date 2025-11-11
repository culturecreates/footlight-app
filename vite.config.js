import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        presets: [
          [
            '@babel/preset-react',
            {
              runtime: 'automatic',
            },
          ],
        ],
      },
    }),
    svgr(),
    eslint({
      cache: false,
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: ['node_modules', 'build'],
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'build',
    manifest: true,
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['test.footlight.app'],
  },
});

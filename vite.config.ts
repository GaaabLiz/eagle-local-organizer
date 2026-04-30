import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

/**
 * Eagle runs plugins in a Chromium window with Node.js integration via file:// protocol.
 * ES modules with bare specifier imports (import fs from 'fs') fail in this context.
 * This plugin rewrites the HTML to use a plain <script> tag instead of <script type="module">.
 */
function eagleCompatPlugin(): Plugin {
  return {
    name: 'eagle-compat',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/ type="module"/g, '')
        .replace(/ crossorigin/g, '');
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '' },
      ],
    }),
    eagleCompatPlugin(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome107',
    modulePreload: false,
    rollupOptions: {
      external: ['fs', 'path', 'os', 'child_process'],
      output: {
        format: 'iife',
        name: 'LocalOrganizer',
        globals: {
          fs: 'require("fs")',
          path: 'require("path")',
          os: 'require("os")',
          'child_process': 'require("child_process")',
        },
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.ts'),
      name: 'SnapyForms',
      formats: ['umd'],
      fileName: (format) => `widget${format === 'umd' ? '.min' : ''}.js`
    },
    minify: true,
    rollupOptions: {
      output: {
        assetFileNames: 'widget.[ext]'
      }
    }
  }
});

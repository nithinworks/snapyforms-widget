import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.ts'),
      name: 'SnapyForms',
      fileName: 'widget',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'widget.[ext]'
      }
    }
  }
});

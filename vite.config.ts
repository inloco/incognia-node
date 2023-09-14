import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { dependencies } from './package.json'

export default defineConfig({
  plugins: [
    dts({
      include: 'src/**/*.{ts,tsx}'
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(dependencies)],
      output: {
        preserveModules: true,
        exports: 'named'
      }
    },
    target: 'esnext',
    sourcemap: true
  }
})

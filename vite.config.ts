import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { dependencies } from './package.json'
import { builtinModules } from 'module'

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
]

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
      fileName: format => {
        if (format === 'cjs') return `index.${format}`
        return `index.${format}.js`
      }
    },
    rollupOptions: {
      external: [...Object.keys(dependencies), ...nodeBuiltins],
      output: {
        preserveModules: true,
        exports: 'named',
        interop: 'auto'
      }
    },
    target: 'esnext',
    sourcemap: true
  }
})

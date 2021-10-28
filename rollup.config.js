import { babel } from '@rollup/plugin-babel'

export default {
  external: ['axios', 'qs', 'snakecase-keys', /@babel\/runtime/],
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  plugins: [babel({ babelHelpers: 'runtime' })]
}

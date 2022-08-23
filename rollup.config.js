import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './worker/worker/index.js',
  output: {
    file: './public/worker.js',
    format: 'iife',
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};

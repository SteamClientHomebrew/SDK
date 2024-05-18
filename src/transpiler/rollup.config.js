import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

export default {
  input: 'index.ts',
  context: 'window',
  output: {
    file: '../../linker/index.js'
  },
  plugins: [commonjs(), typescript(), json()]
};
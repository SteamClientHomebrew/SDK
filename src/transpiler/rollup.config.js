import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

export default {
  input: 'index.ts',
  context: 'window',
  output: {
    file: '../../linker/index.js'
  },
  plugins: [commonjs(), typescript(), json()],
  external: [
    "chalk", 
    "path", 
    "url", 
    "fs/promises", 
    "fs", 
    "rollup", 
    "@rollup/plugin-json", 
    "@rollup/plugin-commonjs", 
    "@rollup/plugin-replace", 
    "rollup-plugin-typescript2", 
    "@rollup/plugin-node-resolve",
    "rollup-plugin-import-css",
    "@rollup/plugin-terser",
    "perf_hooks",
  ]
};
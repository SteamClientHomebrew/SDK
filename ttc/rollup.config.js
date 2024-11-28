import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'index.ts',
  context: 'window',
  output: {
    file: '../dist/ttc/index.js'
  },
  plugins: [commonjs(), typescript(), json(), terser()],
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
    "@rollup/plugin-typescript", 
    "@rollup/plugin-node-resolve",
    "rollup-plugin-import-css",
    "@rollup/plugin-terser",
    "perf_hooks",
  ]
};
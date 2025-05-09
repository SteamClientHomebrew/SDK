import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import externalGlobals from 'rollup-plugin-external-globals';

export default {
	input: 'src/preload.ts',
	context: 'window',
	external: ['react', 'react-dom'],
	output: {
		dir: 'build',
		format: 'esm',
		chunkFileNames: (chunkInfo) => {
			return 'chunk-[hash].js';
		},
		sourcemap: true,
	},
	plugins: [
		commonjs(),
		nodeResolve({
			browser: true,
		}),
		externalGlobals({
			react: 'SP_REACT',
			'react-dom': 'SP_REACTDOM',
		}),
		typescript(),
		json(),
		terser(),
		replace({
			preventAssignment: false,
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	],
};

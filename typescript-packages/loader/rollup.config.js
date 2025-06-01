import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import externalGlobals from 'rollup-plugin-external-globals';
import del from 'rollup-plugin-del';

import client from '../client/package.json' assert { type: 'json' };
import browser from '../browser/package.json' assert { type: 'json' };

import injectProcessEnv from 'rollup-plugin-inject-process-env';

const clientVersion = client.version;
const browserVersion = browser.version;

export default {
	input: 'src/index.ts',
	context: 'window',
	external: ['react', 'react-dom'],
	output: {
		dir: 'build',
		format: 'esm',
		entryFileNames: `millennium-pre.c${clientVersion}.b${browserVersion}.js`,
		chunkFileNames: 'chunks/[hash].js',
		sourcemap: true,
	},
	preserveEntrySignatures: true,
	treeshake: {
		pureExternalImports: false,
		preset: 'smallest',
	},
	plugins: [
		del({
			targets: ['build/*', 'build/.*'],
			runOnce: true,
		}),
		injectProcessEnv({
			MILLENNIUM_FRONTEND_LIB_VERSION: clientVersion,
			MILLENNIUM_BROWSER_LIB_VERSION: browserVersion,
			MILLENNIUM_LOADER_BUILD_DATE: new Date().toISOString(),
		}),
		resolve(),
		commonjs(),
		externalGlobals({
			react: 'SP_REACT',
			'react-dom': 'SP_REACTDOM',
		}),
		typescript(),
		replace({
			preventAssignment: false,
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		terser(),
	],
};

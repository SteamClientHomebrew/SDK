import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Bundles the API shim with the API module.
 */
function __api_module__() {
    return {
        generateBundle(_, bundle) {
            for (const fileName in bundle) {
                if (bundle[fileName].type === 'chunk') {
                    const shimPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist/shim.js');
                    const shimCode = fs.readFileSync(shimPath, 'utf-8'); fs.unlinkSync(shimPath);
                    bundle[fileName].code = `${shimCode.replace("({}, window.SP_REACT)", "")}\n${bundle[fileName].code}`;
                }
            }
        }
    };
}

/**
 * Bunldes the webkit shim with the API module
 */
function __webkit_api_module__() {
    return {
        generateBundle(_, bundle) {
            for (const fileName in bundle) {
                if (bundle[fileName].type === 'chunk') {
                    const shimPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist/webkit.js')
                    const shimCode = fs.readFileSync(shimPath, 'utf-8'); fs.unlinkSync(shimPath);
                    bundle[fileName].code = `${shimCode.replace("})({})", "})")}\n${bundle[fileName].code}`;
                }
            }
        }
    };
}

const rollupAPI = {
    input: 'dist/index.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'dist/shim.js',
        format: 'iife',
        name: 'millennium_api_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] })]
};

const rollupPreload = {
    input: 'src/preload.ts',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'dist/preload.js',
        format: 'iife',
        name: 'millennium_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] }), typescript(), __api_module__()]
};


const rollupWebkitAPI = {
    input: 'dist/api/index.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'dist/webkit.js',
        format: 'iife',
        name: 'millennium_webkit_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] })]
};

const rollupWebkitPreload = {
    input: 'src/preload.ts',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'dist/webkit_preload.js',
        format: 'iife',
        name: 'millennium_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] }), typescript(), __webkit_api_module__()]
};

export default [rollupAPI, rollupPreload, rollupWebkitAPI, rollupWebkitPreload];
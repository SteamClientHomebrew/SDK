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
                    const millenniumAPI = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'build/webkit.js'), 'utf-8')
                    const shimCode      = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'build/shim.js'  ), 'utf-8');

                    bundle[fileName].code = `${shimCode.replace("({}, window.SP_REACT)", "")}${millenniumAPI.replace("})({})", "})")}\n${bundle[fileName].code}`;
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
                    const shimPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'build/webkit.js')
                    const shimCode = fs.readFileSync(shimPath, 'utf-8'); fs.unlinkSync(shimPath);
                    bundle[fileName].code = `${shimCode.replace("})({})", "})")}\n${bundle[fileName].code}`;
                }
            }
        }
    };
}

const ConstructSteamComponents = {
    input: '../build/client/index.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'build/shim.js',
        format: 'iife',
        name: 'steam_client_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] })]
};

const ConstructMillenniumAPI = {
    input: 'build/api/src/index.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'build/webkit.js',
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
    input: 'build/api/src/preload.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'build/client_api.js',
        format: 'iife',
        name: 'millennium_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] }), typescript(), __api_module__()]
};

const rollupWebkitPreload = {
    input: 'build/api/src/preload.js',
    context: 'window',
    external: ['react', 'react-dom'],
    output: {
        file: 'build/webkit_api.js',
        format: 'iife',
        name: 'millennium_components',
        globals: {
            react: "window.SP_REACT",
            "react-dom": "window.SP_REACTDOM"
        },
    },
    plugins: [resolve({ extensions: ['.js'] }), typescript(), __webkit_api_module__()]
};

export default [ConstructSteamComponents, ConstructMillenniumAPI, rollupPreload, rollupWebkitPreload];
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function CompileClientModule() {
    const ProcessBundle = (_, bundle) => {
        const basePath = path.dirname(fileURLToPath(import.meta.url));
        const millenniumAPI = fs.readFileSync(path.resolve(basePath, 'build/webkit.js'), 'utf-8').replace("})({})", "})");
        const shimCode = fs.readFileSync(path.resolve(basePath, 'build/shim.js'), 'utf-8').replace("({}, window.SP_REACT)", "");

        for (const [fileName, fileData] of Object.entries(bundle)) {
            if (fileData.type !== 'chunk') continue;
            fileData.code = shimCode + millenniumAPI + fileData.code;
        }
    };
    
    return { generateBundle(_, bundle) { ProcessBundle(_, bundle); } };
}

function CompileWebkitModule() {
    const ProcessBundle = (_, bundle) => {
        const shimPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'build/webkit.js');
        const shimCode = fs.readFileSync(shimPath, 'utf-8').replace("})({})", "})");
        fs.unlinkSync(shimPath);
    
        for (const [fileName, fileData] of Object.entries(bundle)) {
            if (fileData.type !== 'chunk') continue;
            fileData.code = shimCode + fileData.code;
        }
    };
    
    return { generateBundle(_, bundle) { ProcessBundle(_, bundle); } };
}

function MakeConfig({ name, input, outputFile, plugins }) {
    return {
        input, context: 'window', external: ['react', 'react-dom'],
        output: {
            name: name, file: outputFile, format: 'iife',
            globals: { "react": "window.SP_REACT", "react-dom": "window.SP_REACTDOM" },
        },
        plugins: [resolve({ extensions: ['.js'] }), typescript(), ...(plugins ?? [])]
    };
}

const ConstructSteamComponents     = MakeConfig({ name: 'steam_client_components',   input: '../client/build/index.js', outputFile: 'build/shim.js'        });
const ConstructMillenniumAPI       = MakeConfig({ name: 'millennium_api_components', input: 'build/api/src/index.js',   outputFile: 'build/webkit.js' }    );
const ConstructClientPreloadModule = MakeConfig({ name: 'millennium_components',     input: 'build/api/src/preload.js', outputFile: 'build/client_api.js', plugins: [CompileClientModule()] });
const ConstructWebKitPreloadModule = MakeConfig({ name: 'millennium_components',     input: 'build/api/src/preload.js', outputFile: 'build/webkit_api.js', plugins: [CompileWebkitModule()] });

export default [ConstructSteamComponents, ConstructMillenniumAPI, ConstructClientPreloadModule, ConstructWebKitPreloadModule];
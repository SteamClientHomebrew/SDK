#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import * as rollup from 'rollup';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";
import terser from '@rollup/plugin-terser';
import { performance } from 'perf_hooks';

const start = performance.now();
const args = process.argv.slice(2);
let type = "dev"
let target = process.cwd()

import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function hasUpdate() {

    return new Promise(async (resolve) => {
        const packageJsonPath = path.resolve(__dirname, '../../package.json');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    
        fetch("https://registry.npmjs.org/millennium-lib").then(response => response.json()).then(json => {

            if (json?.["dist-tags"]?.latest != packageJson.version) {
                console.warn(`[+] millennium-lib@${packageJson.version} requires update to ${json?.["dist-tags"]?.latest}`)
                console.log("   run `npm i millennium-lib` to get latest updates! ")
                resolve(true)
            }
            else {
                console.log(`[+] millennium-lib@${packageJson.version} is up-to-date!`)
                resolve(false)
            }
        })
    })
}

const update = await hasUpdate();

function printHelp() {

    console.log("millennium-lib parameter list:"
        + "\n\t\x1b[35m--help\x1b[0m: display parameter list"
        + "\n\t\x1b[1m\x1b[31m--build\x1b[0m\x1b[0m: \x1b[1m\x1b[31m(required)\x1b[0m\x1b[0m: build type [dev, prod] (prod minifies code)"
        + "\n\t\x1b[35m--target\x1b[0m: path to plugin, default to cwd"
    );
}

if (args.includes("--help")) {
    printHelp()
    process.exit();
}

if (!args.includes("--build")) {
    console.error('\x1b[91m%s\x1b[0m', 'invalid parameters');
    printHelp()
    process.exit();
}

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--build") {
        type = args[i + 1]

        if (type === undefined || !["dev", "prod"].includes(type)) {
            console.error('\x1b[91m%s\x1b[0m', '--build parameter must be preceded by build type [dev, prod]');
            process.exit();
        }
    }

    if (args[i] == "--target") {
        target = args[i + 1]

        if (target === undefined) {
            console.error('\x1b[91m%s\x1b[0m', '--target parameter must be preceded by system path');
            process.exit();
        }
    }
}

console.log("[+] warming compiler...")
console.log("\x1b[35m    --target:\x1b[92m", target, "\x1b[0m");
console.log("\x1b[35m    --build:\x1b[92m", type, "\x1b[0m");

process.stdout.write("\n[?] verifying build target...");

if (!fs.existsSync(target)) {
    console.error('\x1b[91m%s\x1b[0m', `--target [${target}] is not a valid system path`);
    process.exit();
}

const pluginModule = path.join(target, "plugin.json")

if (!fs.existsSync(pluginModule)) {
    console.error('\x1b[91m%s\x1b[0m', `--target [${target}] is not a valid plugin (missing plugin.json)`);
    process.exit();
}

fs.readFile(pluginModule, 'utf8', (err, data) => {
    if (err) {
        console.error('\x1b[91m%s\x1b[0m', `couldn't read plugin.json from [${pluginModule}]`);
        return;
    }

    try {
        setup_compiler(JSON.parse(data));
    } 
    catch (parseError) {
        console.error('\x1b[91m%s\x1b[0m', `coudln't parse json in [${pluginModule}]`);
    }
});

// wrap the callServerMethod to auto input the plugin name
/**
 * @description Intended to wrap callServerMethod in a way that implicitly provides the plugin name 
 * 
 * @param {*} methodName Initial preprocessed method name
 * @param {*} kwargs Initial preprocessed kwargs object 
 * @returns <any>
 */
async function wrappedCallServerMethod(methodName, kwargs) {
	return await Millennium.callServerMethod(pluginName, methodName, kwargs);
}

/**
 * @description Append the active plugin to the global plugin 
 * list and notify that the frontend Loaded.
 */
function globalize() {
	// Assign the plugin on plugin list. 
	Object.assign(window.PLUGIN_LIST[pluginName], millennium_main)
	// Run the rolled up plugins default exported function 
	millennium_main["default"]();
	// Notify Millennium this plugin has loaded. This propegates and calls the backend method.
	MILLENNIUM_BACKEND_IPC.postMessage(1, { pluginName: pluginName })
}

/**
 * @description Simple bootstrap function that initializes PLUGIN_LIST 
 * for current plugin given that is doesnt exist. 
 */
function bootstrap() {
	/** 
	 * This function is called n times depending on n plugin count,
	 * Create the plugin list if it wasn't already created 
	 */
	!window.PLUGIN_LIST && (window.PLUGIN_LIST = {})

	// initialize a container for the plugin
	if (!window.PLUGIN_LIST[pluginName]) {
		window.PLUGIN_LIST[pluginName] = {};
	}
}

function resolveMillennium() 
{
  const cat = (parts) => { return parts.join('\n'); }

  return {
    name: 'add-plugin-main',
    generateBundle(_, bundle)
	{	
		for (const fileName in bundle) 
		{
			if (bundle[fileName].type != 'chunk') {
				continue 
			}

			process.stdout.write("[+] injecting millennium shims...");

			bundle[fileName].code = cat([
				`const pluginName = "${global.targetPluginModule["name"]}";`,
				bootstrap.toString(), bootstrap.name + "()",
				wrappedCallServerMethod.toString(), bundle[fileName].code,
				globalize.toString(), globalize.name + "()"
			])

            console.log("\x1b[32m okay\x1b[0m");
		}
    }
  };
}

function fetchPlugins() {
	const pluginList = [
		typescript({
			exclude: [ "*millennium.ts" ]
		}),
		resolveMillennium(),
		nodeResolve(),
		commonjs(),
		json(),
		css(),
		replace({
			preventAssignment: true,
			// replace callServerMethod with wrapped replacement function. 
			'Millennium.callServerMethod': `wrappedCallServerMethod`,
			delimiters: ['', ''],
			'm_private_context': 'window.PLUGIN_LIST[pluginName]',
		}),
	]
	
	if (global.tersePlugin) {
		pluginList.push(terser())
	}
	return pluginList
}

const setup_compiler = async (json) => 
{
    console.log("\x1b[32m okay\x1b[0m");
    global.targetPluginModule = json
    global.tersePlugin = type == "prod"

    console.log("[?] tersing plugin frontend?...", global.tersePlugin)

    const rollupConfig = {
        input: './frontend/index.tsx',
        plugins: fetchPlugins(),
        context: 'window',
        external: ['react', 'react-dom'],
        output: {
            name: "millennium_main",
            file: "dist/index.js",
            globals: {
                react: "window.SP_REACT",
                "react-dom": "window.SP_REACTDOM"
            },
            exports: 'named',
            format: 'iife',
        },
    }

    console.log("[+] starting build, this may take a few moments...")
    // Load the Rollup configuration file
    const bundle = await rollup.rollup(rollupConfig);
    const outputOptions = rollupConfig.output;

    await bundle.write(outputOptions);
    const end = performance.now();

    // Calculate the elapsed time in milliseconds
    const elapsedTime = (end - start).toFixed(3);
    console.log('[+] done!', Number(elapsedTime), 'ms elapsed.');
}
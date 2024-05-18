import { OutputOptions, RollupOptions, rollup } from "rollup";
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";
import terser from '@rollup/plugin-terser';

import chalk from 'chalk'

declare global {
    interface Window {
        PLUGIN_LIST: any
    }
}

declare const pluginName: string, 
              millennium_main: any,
              MILLENNIUM_BACKEND_IPC: any


export interface TranspilerProps {
    bTersePlugin?: boolean,
    strPluginInternalName: string
}

// wrap the callServerMethod to auto input the plugin name
/**
 * @description Intended to wrap callServerMethod in a way that implicitly provides the plugin name 
 * 
 * @param {*} methodName Initial preprocessed method name
 * @param {*} kwargs Initial preprocessed kwargs object 
 * @returns <any>
 */
async function wrappedCallServerMethod(methodName: string, kwargs: any) {
    // @ts-ignore
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

function InsertMillennium(props: TranspilerProps) 
{
    const ContructFunctions = (parts: any) => { return parts.join('\n'); }

    const generateBundle = (_: unknown, bundle: any) => {	

		for (const fileName in bundle) 
		{
			if (bundle[fileName].type != 'chunk') {
				continue 
			}
			process.stdout.write("[+] injecting millennium shims...");

			bundle[fileName].code = ContructFunctions([    
                // define the plugin name at the top of the bundle, so it can be used in wrapped functions
				`const pluginName = "${props.strPluginInternalName}";`,
                // insert the bootstrap function and call it
				bootstrap.toString(), bootstrap.name + "()",
				wrappedCallServerMethod.toString(), bundle[fileName].code,
                // insert globalize function and run it
				globalize.toString(), globalize.name + "()"
			])

            console.log(chalk.green.bold(" okay"))
		}
    }

    return {
        name: 'add-plugin-main', generateBundle
    };
}

function GetPluginComponents(props: TranspilerProps) {
	const pluginList = [
        /**
         * @brief resolve millennium, edit the exported bundle to work with millennium
         */
        InsertMillennium(props),
		typescript(), nodeResolve(), commonjs(), json(), css(),
		replace({
			preventAssignment: true,
			// replace callServerMethod with wrapped replacement function. 
			'Millennium.callServerMethod': `wrappedCallServerMethod`,
			delimiters: ['', ''],
			'm_private_context': 'window.PLUGIN_LIST[pluginName]',
		}),
	]
	
	if (props.bTersePlugin) {
		pluginList.push(terser())
	}
	return pluginList
}

export const TranspilerPluginComponent = async (props: TranspilerProps) => {
    
    console.log("[?] tersing plugin frontend?...", props.bTersePlugin)

    const rollupConfig: RollupOptions = {
        input: './frontend/index.tsx',
        plugins: GetPluginComponents(props),
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
    const bundle = await rollup(rollupConfig);
    const outputOptions = rollupConfig.output as OutputOptions;

    await bundle.write(outputOptions);
    // const end = performance.now();

    // console.log('[+] done!', Number((end - start).toFixed(3)), 'ms elapsed.');
}
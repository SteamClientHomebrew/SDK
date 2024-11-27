import { OutputOptions, RollupOptions, rollup } from "rollup";
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

import chalk from 'chalk'
import { Logger } from "./Logger";
import fs from 'fs';

declare global {
    interface Window {
        PLUGIN_LIST: any
    }
}

declare const pluginName: string, millennium_main: any, MILLENNIUM_BACKEND_IPC: any

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

    return new Promise((resolve, reject) => { 
        // @ts-ignore
        Millennium.callServerMethod(pluginName, methodName, kwargs).then((result: any) => {
            resolve(result);
        }).catch((error: any) => {
            reject(error)
        })
    })

}

/**
 * @description Append the active plugin to the global plugin 
 * list and notify that the frontend Loaded.
 */
function ExecutePluginModule() {
	// Assign the plugin on plugin list. 
	Object.assign(window.PLUGIN_LIST[pluginName], millennium_main)
	// Run the rolled up plugins default exported function 
	millennium_main["default"]();
	MILLENNIUM_BACKEND_IPC.postMessage(1, { pluginName: pluginName })
}

/**
 * @description Append the active plugin to the global plugin 
 * list and notify that the frontend Loaded.
 */
function ExecuteWebkitModule() {
	// Assign the plugin on plugin list. 
	Object.assign(window.PLUGIN_LIST[pluginName], millennium_main)
	// Run the rolled up plugins default exported function 
	millennium_main["default"]();
}

/**
 * @description Simple bootstrap function that initializes PLUGIN_LIST 
 * for current plugin given that is doesnt exist. 
 */
function InitializePlugins() {
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
            Logger.Info("Injecting Millennium shims into module... " + chalk.green.bold("okay"))

			bundle[fileName].code = ContructFunctions([    
                // define the plugin name at the top of the bundle, so it can be used in wrapped functions
				`const pluginName = "${props.strPluginInternalName}";`,
                // insert the bootstrap function and call it
				InitializePlugins.toString(), InitializePlugins.name + "()",
				wrappedCallServerMethod.toString(), bundle[fileName].code,
				ExecutePluginModule.toString(), ExecutePluginModule.name + "()"
			])
		}
    }

    return {
        name: 'add-plugin-main', generateBundle
    };
}

function InsertWebkitMillennium(props: TranspilerProps) 
{
    const ContructFunctions = (parts: any) => { return parts.join('\n'); }

    const generateBundle = (_: unknown, bundle: any) => {	

		for (const fileName in bundle) 
		{
			if (bundle[fileName].type != 'chunk') {
				continue 
			}
            Logger.Info("Injecting Millennium shims into webkit module... " + chalk.green.bold("okay"))

			bundle[fileName].code = ContructFunctions([    
                // define the plugin name at the top of the bundle, so it can be used in wrapped functions
				`const pluginName = "${props.strPluginInternalName}";`,
                // insert the bootstrap function and call it
                InitializePlugins.toString(), InitializePlugins.name + "()",
				wrappedCallServerMethod.toString(), bundle[fileName].code,
				ExecuteWebkitModule.toString(), ExecuteWebkitModule.name + "()"
			])
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
		typescript(), nodeResolve(), commonjs(), json(),
		replace({
			preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
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

function GetWebkitPluginComponents(props: TranspilerProps) {
	const pluginList = [
        InsertWebkitMillennium(props), typescript(), nodeResolve(), commonjs(), json(),
        replace({
			preventAssignment: true,
			// replace callServerMethod with wrapped replacement function. 
			'Millennium.callServerMethod': `wrappedCallServerMethod`,
			delimiters: ['', ''],
		}),
	]
	
	if (props.bTersePlugin) {
		pluginList.push(terser())
	}
	return pluginList
}

const GetFrontEndDirectory = () => {
    const pluginJsonPath = './plugin.json';

    try {
        const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
        const frontendDirectory = pluginJson?.frontend;

        return frontendDirectory ? frontendDirectory : "frontend";
    } 
    catch (error) {
        return "frontend";
    }
}

export const TranspilerPluginComponent = async (props: TranspilerProps) => {
    
    const frontendRollupConfig: RollupOptions = {
        input: `./${GetFrontEndDirectory()}/index.tsx`,
        plugins: GetPluginComponents(props),
        context: 'window',
        external: ['react', 'react-dom'],
        output: {
            name: "millennium_main",
            file: ".millennium/Dist/index.js",
            globals: {
                react: "window.SP_REACT",
                "react-dom": "window.SP_REACTDOM"
            },
            exports: 'named',
            format: 'iife'
        }
    }

    const webkitRollupConfig: RollupOptions = {
        input: `./webkit/index.ts`,
        plugins: GetWebkitPluginComponents(props),
        context: 'window',
        output: {
            name: "millennium_main",
            file: ".millennium/Dist/webkit.js",
            exports: 'named',
            format: 'iife'
        }
    }

    Logger.Info("Starting build; this may take a few moments...")
    // Load the Rollup configuration file
    try {
        const bundle = await rollup(frontendRollupConfig);
        const outputOptions = frontendRollupConfig.output as OutputOptions;
    
        await bundle.write(outputOptions);

        // check if the webkit file exists
        if (fs.existsSync(`./webkit/index.ts`)) {
            Logger.Info("Compiling webkit module...")

            const bundle1 = await rollup(webkitRollupConfig);
            const outputOptions1 = webkitRollupConfig.output as OutputOptions;
        
            await bundle1.write(outputOptions1);
        }
        
        Logger.Info('Build succeeded!', Number((performance.now() - global.PerfStartTime).toFixed(3)), 'ms elapsed.')
    }
    catch (exception) {
        Logger.Error('Build failed!', exception)
    }
}
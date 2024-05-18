#!/usr/bin/env node
import chalk from 'chalk';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { existsSync, readFile as readFile$1 } from 'fs';
import { rollup } from 'rollup';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';
import terser from '@rollup/plugin-terser';

/***
 * @brief print the parameter list to the stdout
 */
const PrintParamHelp = () => {
    console.log("millennium-lib parameter list:" +
        "\n\t" + chalk.magenta("--help") + ": display parameter list" +
        "\n\t" + chalk.bold.red("--build") + ": " + chalk.bold.red("(required)") + ": build type [dev, prod] (prod minifies code)" +
        "\n\t" + chalk.magenta("--target") + ": path to plugin, default to cwd");
};
var BuildType;
(function (BuildType) {
    BuildType[BuildType["DevBuild"] = 0] = "DevBuild";
    BuildType[BuildType["ProdBuild"] = 1] = "ProdBuild";
})(BuildType || (BuildType = {}));
const ValidateParameters = (args) => {
    let typeProp = BuildType.DevBuild, targetProp = process.cwd();
    if (args.includes("--help")) {
        PrintParamHelp();
        process.exit();
    }
    // startup args are invalid
    if (!args.includes("--build")) {
        console.error('\x1b[91m%s\x1b[0m', 'invalid parameters');
        PrintParamHelp();
        process.exit();
    }
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--build") {
            switch (args[i + 1]) {
                case "dev": typeProp = BuildType.DevBuild;
                case "prod": typeProp = BuildType.ProdBuild;
                default: {
                    console.error(chalk.red('--build parameter must be preceded by build type [dev, prod]'));
                    process.exit();
                }
            }
        }
        if (args[i] == "--target") {
            if (args[i + 1] === undefined) {
                console.error(chalk.red('--target parameter must be preceded by system path'));
                process.exit();
            }
            targetProp = args[i + 1];
        }
    }
    return {
        type: typeProp,
        targetPlugin: targetProp
    };
};

const CheckForUpdates = async () => {
    return new Promise(async (resolve) => {
        const packageJsonPath = path.resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        fetch("https://registry.npmjs.org/millennium-lib").then(response => response.json()).then(json => {
            if (json?.["dist-tags"]?.latest != packageJson.version) {
                console.warn(`[+] millennium-lib@${packageJson.version} requires update to ${json?.["dist-tags"]?.latest}`);
                console.log("   run `npm i millennium-lib` to get latest updates! ");
                resolve(true);
            }
            else {
                console.log(`[+] millennium-lib@${packageJson.version} is up-to-date!`);
                resolve(false);
            }
        });
    });
};

const ValidatePlugin = (target) => {
    return new Promise((resolve, reject) => {
        if (!existsSync(target)) {
            console.error(chalk.red.bold(`\n[-] --target [${target}] `) + chalk.red("is not a valid system path"));
            reject();
            return;
        }
        const pluginModule = path.join(target, "plugin.json");
        if (!existsSync(pluginModule)) {
            console.error(chalk.red.bold(`\n[-] --target [${target}] `) + chalk.red("is not a valid plugin (missing plugin.json)"));
            reject();
            return;
        }
        readFile$1(pluginModule, 'utf8', (err, data) => {
            if (err) {
                console.error(chalk.red.bold(`\n[-] couldn't read plugin.json from [${pluginModule}]`));
                reject();
                return;
            }
            try {
                if (!("name" in JSON.parse(data))) {
                    console.error(chalk.red.bold(`\n[-] target plugin doesn't contain "name" in plugin.json [${pluginModule}]`));
                    reject();
                }
                else {
                    resolve(JSON.parse(data));
                }
            }
            catch (parseError) {
                console.error(chalk.red.bold(`\n[-] couldn't parse JSON in plugin.json from [${pluginModule}]`));
                reject();
            }
        });
    });
};

// wrap the callServerMethod to auto input the plugin name
/**
 * @description Intended to wrap callServerMethod in a way that implicitly provides the plugin name
 *
 * @param {*} methodName Initial preprocessed method name
 * @param {*} kwargs Initial preprocessed kwargs object
 * @returns <any>
 */
async function wrappedCallServerMethod(methodName, kwargs) {
    // @ts-ignore
    return await Millennium.callServerMethod(pluginName, methodName, kwargs);
}
/**
 * @description Append the active plugin to the global plugin
 * list and notify that the frontend Loaded.
 */
function globalize() {
    // Assign the plugin on plugin list. 
    Object.assign(window.PLUGIN_LIST[pluginName], millennium_main);
    // Run the rolled up plugins default exported function 
    millennium_main["default"]();
    // Notify Millennium this plugin has loaded. This propegates and calls the backend method.
    MILLENNIUM_BACKEND_IPC.postMessage(1, { pluginName: pluginName });
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
    !window.PLUGIN_LIST && (window.PLUGIN_LIST = {});
    // initialize a container for the plugin
    if (!window.PLUGIN_LIST[pluginName]) {
        window.PLUGIN_LIST[pluginName] = {};
    }
}
function InsertMillennium(props) {
    const ContructFunctions = (parts) => { return parts.join('\n'); };
    const generateBundle = (_, bundle) => {
        for (const fileName in bundle) {
            if (bundle[fileName].type != 'chunk') {
                continue;
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
            ]);
            console.log(chalk.green.bold(" okay"));
        }
    };
    return {
        name: 'add-plugin-main', generateBundle
    };
}
function GetPluginComponents(props) {
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
    ];
    if (props.bTersePlugin) {
        pluginList.push(terser());
    }
    return pluginList;
}
const TranspilerPluginComponent = async (props) => {
    console.log("[?] tersing plugin frontend?...", props.bTersePlugin);
    const rollupConfig = {
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
    };
    console.log("[+] starting build, this may take a few moments...");
    // Load the Rollup configuration file
    const bundle = await rollup(rollupConfig);
    const outputOptions = rollupConfig.output;
    await bundle.write(outputOptions);
    // const end = performance.now();
    // console.log('[+] done!', Number((end - start).toFixed(3)), 'ms elapsed.');
};

const CheckModuleUpdates = async () => {
    return await CheckForUpdates();
};
const StartCompilerModule = () => {
    const parameters = ValidateParameters(process.argv.slice(2));
    console.log("[+] " + chalk.white.bold("warming compiler..."));
    console.log(chalk.magenta.bold("--target: ") + chalk.white(parameters.targetPlugin));
    console.log(chalk.magenta.bold("--build: ") + chalk.white(parameters.type));
    ValidatePlugin(parameters.targetPlugin).then((json) => {
        const props = {
            bTersePlugin: parameters.type == BuildType.ProdBuild,
            strPluginInternalName: json?.name
        };
        TranspilerPluginComponent(props);
    })
        /**
         * plugin is invalid, we close the proccess as it has already been handled
         */
        .catch(() => {
        process.exit();
    });
};
const Initialize = () => {
    CheckModuleUpdates().then(() => {
        StartCompilerModule();
    });
};
Initialize();

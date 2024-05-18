#!/usr/bin/env node

import chalk from 'chalk'
import { BuildType, ValidateParameters } from "./parameters"
import { CheckForUpdates } from "./updater"
import { ValidatePlugin } from './pluginValidate'
import { TranspilerPluginComponent, TranspilerProps } from './transpiler'

const CheckModuleUpdates = async () => {
    return await CheckForUpdates()
}

const StartCompilerModule = () => {
    const parameters = ValidateParameters( process.argv.slice(2) );

    console.log("[+] " + chalk.white.bold("warming compiler..."));
    console.log(chalk.magenta.bold("--target: ") + chalk.white(parameters.targetPlugin));
    console.log(chalk.magenta.bold("--build: ") + chalk.white(parameters.type));

    ValidatePlugin(parameters.targetPlugin).then((json: any) => {

        const props: TranspilerProps = {
            bTersePlugin: parameters.type == BuildType.ProdBuild,
            strPluginInternalName: json?.name
        }

        TranspilerPluginComponent(props)
    })

    /**
     * plugin is invalid, we close the proccess as it has already been handled
     */
    .catch(() => {
        process.exit()
    }) 
}

const Initialize = () => {

    CheckModuleUpdates().then(() => {
        StartCompilerModule()
    })
}

Initialize();
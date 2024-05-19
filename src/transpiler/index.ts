#!/usr/bin/env node

import { BuildType, ValidateParameters } from "./parameters"
import { CheckForUpdates } from "./updater"
import { ValidatePlugin } from './pluginValidate'
import { TranspilerPluginComponent, TranspilerProps } from './transpiler'
import { performance } from 'perf_hooks';
import { Logger } from './logger'

declare global {
    var PerfStartTime: number;
}

const CheckModuleUpdates = async () => {
    return await CheckForUpdates()
}

const StartCompilerModule = () => {

    const parameters   = ValidateParameters( process.argv.slice(2) );
    const bTersePlugin = parameters.type == BuildType.ProdBuild

    Logger.Tree("Transpiler config: ", {
        target: parameters.targetPlugin,
        build: BuildType[parameters.type],
        minify: bTersePlugin
    })

    ValidatePlugin(parameters.targetPlugin).then((json: any) => {

        const props: TranspilerProps = {
            bTersePlugin: bTersePlugin,
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
    global.PerfStartTime = performance.now();

    CheckModuleUpdates().then(() => {
        StartCompilerModule()
    })
}

Initialize();
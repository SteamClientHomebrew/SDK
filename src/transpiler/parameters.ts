import chalk from 'chalk'

/***
 * @brief print the parameter list to the stdout
 */
export const PrintParamHelp = () => {

    console.log(
        "millennium-lib parameter list:" +
        "\n\t" + chalk.magenta("--help") + ": display parameter list" +
        "\n\t" + chalk.bold.red("--build") + ": " + chalk.bold.red("(required)") + ": build type [dev, prod] (prod minifies code)" +
        "\n\t" + chalk.magenta("--target") + ": path to plugin, default to cwd"
    );
}

export enum BuildType {
    DevBuild, ProdBuild
}

export interface ParameterProps {
    type: BuildType, 
    targetPlugin: string // path
}

export const ValidateParameters = (args: Array<string>): ParameterProps => {

    let typeProp: BuildType = BuildType.DevBuild, targetProp: string = process.cwd()

    if (args.includes("--help")) {
        PrintParamHelp()
        process.exit();
    }
    
    // startup args are invalid
    if (!args.includes("--build")) {
        console.error('\x1b[91m%s\x1b[0m', 'invalid parameters');
        PrintParamHelp()
        process.exit();
    }
    
    for (let i = 0; i < args.length; i++) 
    {
        if (args[i] === "--build") 
        {
            switch (args[i + 1]) {
                case "dev": typeProp = BuildType.DevBuild
                case "prod": typeProp = BuildType.ProdBuild
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

            targetProp = args[i + 1]
        }
    }

    return {
        type: typeProp,
        targetPlugin: targetProp
    }
}
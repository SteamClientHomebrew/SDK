import chalk from 'chalk'
import path from 'path'
import { existsSync, readFile } from 'fs'

export const ValidatePlugin = (target: string): Promise<any> => {

    return new Promise<any>((resolve, reject) => {
        if (!existsSync(target)) {
            console.error(chalk.red.bold(`\n[-] --target [${target}] `) + chalk.red("is not a valid system path"))
            reject() 
            return
        }
        
        const pluginModule = path.join(target, "plugin.json")
        
        if (!existsSync(pluginModule)) {
            console.error(chalk.red.bold(`\n[-] --target [${target}] `) + chalk.red("is not a valid plugin (missing plugin.json)"))
            reject()
            return
        }
        
        readFile(pluginModule, 'utf8', (err, data) => {
            if (err) {
                console.error(chalk.red.bold(`\n[-] couldn't read plugin.json from [${pluginModule}]`))
                reject()
                return
            }
        
            try {
                if (!("name" in JSON.parse(data))) {
                    console.error(chalk.red.bold(`\n[-] target plugin doesn't contain "name" in plugin.json [${pluginModule}]`))
                    reject()
                }
                else {
                    resolve(JSON.parse(data)) 
                }
            } 
            catch (parseError) {
                console.error(chalk.red.bold(`\n[-] couldn't parse JSON in plugin.json from [${pluginModule}]`))
                reject()
            }
        });
    })
}
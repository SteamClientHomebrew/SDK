import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { dirname } from 'path';

export const CheckForUpdates = async (): Promise<boolean> => {
    return new Promise<boolean>(async (resolve) => {
        const packageJsonPath = path.resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json');
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
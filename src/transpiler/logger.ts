import chalk from 'chalk'

const Logger = {

    Info: (...LogMessage: any) => {
        console.log(chalk.magenta.bold("[+]"), ...LogMessage)
    },

    Warn: (...LogMessage: any) => {
        console.log(chalk.yellow.bold("[*]"), ...LogMessage)
    },

    Error: (...LogMessage: any) => {
        console.log(chalk.red.bold("[-]"), ...LogMessage)
    },

    Tree: (strTitle: string, LogObject: any) => { 

        console.log(chalk.magenta.bold("[┬]"), strTitle);

        const isLocalPath = (strTestPath: string): boolean => {
            // Regular expression to match common file path patterns
            const filePathRegex = /^(\/|\.\/|\.\.\/|\w:\/)?([\w-.]+\/)*[\w-.]+\.\w+$/;
            return filePathRegex.test(strTestPath);
        }

        const entries = Object.entries(LogObject);
        const totalEntries = entries.length;

        for (const [index, [key, value]] of entries.entries()) {

            const connector = index === totalEntries - 1 ? "└" : "├"
            let color = chalk.white

            switch (typeof value) {
                case typeof String(): {
                    color = isLocalPath(value as string) ? chalk.blueBright : chalk.white; 
                    break
                }
                case typeof Boolean(): color = chalk.green; break
                case typeof Number(): color = chalk.yellow; break
            }

            console.log(chalk.magenta.bold(` ${connector}──${key}:`), color(value))
        }
    }
}

export { Logger }
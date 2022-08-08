import * as ora from 'ora'
import * as chalk from 'chalk'

const spinner = ora()
const msg = text => `${text}...\n`
export const startSpinner = (text?: string) => {
    spinner.start(msg(text))
    // 停止并返回实例
    /*  spinner.stopAndPersist({
         symbol: '✨',
         text: msg,
     }) */
}

export const succeedSpinner = (text?: string) => {
    spinner.succeed(msg(text))
    /*  spinner.stopAndPersist({
         symbol: '🎉',
         text: `${text}\n`
     }) */
}

export const failSpinner = (text?: string) => {
    spinner.fail(chalk.red(text))
}
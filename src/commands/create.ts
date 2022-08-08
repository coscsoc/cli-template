import * as path from 'path'
import * as handlebars from 'handlebars'
import * as inquirer from 'inquirer'
import {
    cwd, chalk, execa, fse, startSpinner, succeedSpinner, warn, info, failSpinner,
} from '../lib'

// 检查是否已经存在相同名字工程
export const checkProjectExist = async (targetDir) => {
    if (fse.existsSync(targetDir)) {
        const answer = await inquirer.prompt({
            type: "list",
            name: "checkExist",
            message: `\n仓库路径${targetDir}已存在，请选择`,
            choices: ['覆盖', '取消'],
        })
        if (answer.checkExist === '覆盖') {
            warn(`删除${targetDir}...`)
            fse.removeSync(targetDir)
        } else {
            return true
        }
    }
    return false
}

// 询问用户配置
export const getQuestions = async (projectName) => {
    return await inquirer.prompt([
        {
            type: 'input', name: 'name',
            message: `package name: (${projectName})`,
            efault: projectName,
        },
        { type: 'input', name: 'description', message: 'description', },
        { type: 'input', name: 'author', message: 'author', },
        { type: 'input', name: 'vuex', message: 'vuex', }
    ])
}

export const cloneProject = async (targetDir, projectName, projectInfo) => {
    startSpinner(`开始创建cli模板 ${chalk.cyan(targetDir)}`)
    await fse.copy(
        path.join(__dirname, '..', '..', 'project-template'),
        targetDir
    )

    // handlebars模版引擎 根据用户输入的信息 替换package.json
    const pkgPath = `${targetDir}/package.json`
    const pkgContent = fse.readFileSync(pkgPath, 'utf-8')
    const pkgResult = handlebars.compile(pkgContent)(projectInfo)
    //将解析后的结果重写到package.json文件中
    fse.writeFileSync(pkgPath, pkgResult)

    // 新建工程装包
    execa.commandSync('npm install', {
        stdio: 'inherit',
        cwd: targetDir,
    })
    succeedSpinner(`cli模板创建完成 ${chalk.yellow(projectName)}\n👉 输入以下命令启动:`)
    info(`
        $ cd ${projectName}\n
        $ sh start.sh\n
    `)
}

const action = async (projectName: string, cmdArgs?: any) => {
    try {
        const targetDir = path.join(cmdArgs?.context || cwd, projectName)

        if (!await checkProjectExist(targetDir)) {
            const projectInfo = await getQuestions(projectName)
            await cloneProject(targetDir, projectName, projectInfo)
        }
    } catch (err) {
        failSpinner(err)
        return
    }
}

export default {
    command: 'create <registry-name>',
    description: '创建一个npmcli模板',
    optionList: [['--context <context>', '上下文路径']],
    action,
}

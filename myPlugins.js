/* eslint-disable no-undef */
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
const chalk = require('chalk');

//目的：通过yarn plugins安装插件 husky lint-staged commitlint prettier eslint
async function init() {
  const allDependencies = [
    'husky',
    'lint-staged',
    '@commitlint/cli',
    '@commitlint/config-conventional',
    'prettier',
    'eslint',
  ];
  console.log(chalk.green(`开始安装插件：${allDependencies.join(' ')}`));
  const result = spawn.sync('yarn', ['add', '-D', ...allDependencies], { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error);
    return;
  }
  console.log(chalk.green(`插件安装成功：${allDependencies.join(' ')}`));
  //创建配置文件
  await createEslintConfig();
  await createPrettierConfig();
  await vscodeSetting();
  await createHuskyLintStagedConfig();
}
async function createEslintConfig() {
  //开启子进程
  console.log(chalk.green('开始创建eslint配置文件'));
  spawn.sync('npx', ['eslint', '--init'], { stdio: 'inherit' });
  console.log(chalk.green('eslint配置文件创建成功'));
  console.log();
  //区分打包工具 vite webpack
  console.log(chalk.green('开始安装eslint插件'));
  const isVite = fs.existsSync(path.resolve(process.cwd(), 'vite.config.js'));
  if (isVite) {
    spawn.sync('yarn', ['add', '-D', 'vite-plugin-eslint'], { stdio: 'inherit' });
  } else {
    spawn.sync('yarn', ['add', '-D', 'eslint-webpack-plugin'], { stdio: 'inherit' });
  }
  //安装eslint解析器 todo 配置eslintrc.cjs
  spawn.sync('yarn', ['add', '-D', '@babel/core', '@babel/eslint-parser', 'eslint-config-alloy'], { stdio: 'inherit' });
  //检查目录是否有eslint配置文件 eslint.cjs eslint.config.cjs
  const eslintConfigPath = path.resolve(process.cwd(), '.eslintrc.cjs','eslint.config.cjs','eslintrc.js','eslintrc.cjs');
  //todo 配置vite.config.js webpack.config.js
  console.log(chalk.green('eslint插件安装成功'));
}

async function createPrettierConfig() {
  console.log(chalk.green('开始创建prettier配置文件'));
  spawn.sync('yarn', ['add', '-D', 'prettier'], { stdio: 'inherit' });
  const prettierConfig = `module.exports = {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 120,
  }`;
  fs.writeFileSync(path.resolve(process.cwd(), '.prettierrc.cjs'), prettierConfig);
  console.log(chalk.green('prettier配置文件创建成功'));
}
async function vscodeSetting() {
  console.log(chalk.green('开始配置vscode'));
  const vscodeSetting = `{
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnPaste": true,
    "editor.formatOnType": true,
    "editor.formatOnSaveMode": "modifications",
    "editor.rulers": [120],
    "editor.tabSize": 2
  }`;
  fs.writeFileSync(path.resolve(process.cwd(), '.vscode/settings.json'), vscodeSetting);
  console.log(chalk.green('vscode配置成功'));
}
async function createHuskyLintStagedConfig() {
  console.log(chalk.green('开始安装husky lint-staged'));
  spawn.sync('yarn', ['add', '-D', 'husky', 'lint-staged'], { stdio: 'inherit' });
  //init husky
  console.log(chalk.green('安装成功'));
  console.log();
  console.log(chalk.green('开始初始化husky'));
  spawn.sync('npx', ['husky-init' ], { stdio: 'inherit' });
  console.log(chalk.green('初始化成功'));
  console.log();
  //添加pre-commit
  console.log(chalk.green('开始添加pre-commit'));
  //写不进去，不知道为什么。自己手动添加吧
  // spawn.sync('npx', ['husky', 'add', '.husky/pre-commit', '"npx lint-staged"'], { stdio: 'inherit' });
  //获取husky配置文件
  const huskyConfigPath = path.resolve(process.cwd(), '.husky/_/pre-commit');
  const huskyConfigContent = fs.readFileSync(huskyConfigPath).toString();
  //添加npx lint-staged
  //将. "${0%/*}/h" 替换为 . "${dirname -- $0}/husky.sh"
  fs.writeFileSync(huskyConfigPath, huskyConfigContent.replace('. "${0%/*}/h', '. "${dirname -- $0}/husky.sh'));
  fs.writeFileSync(huskyConfigPath, huskyConfigContent + '\nnpx lint-staged\n');
  console.log(chalk.green('pre-commit添加成功'));
  console.log();
  //添加commit-msg
  console.log(chalk.green('开始添加commit-msg'));
  // spawn.sync('npx', ['husky', 'add', '.husky/commit-msg', '"npx -- no -- commitlint --edit $1"'], { stdio: 'inherit' });
  //获取husky配置文件
  const commitMsgPath = path.resolve(process.cwd(), '.husky/_/commit-msg');
  const commitMsgContent = fs.readFileSync(commitMsgPath).toString();
  //添加npx -- no -- commitlint --edit $1
  fs.writeFileSync(commitMsgPath, commitMsgContent.replace('. "${0%/*}/h', '. "${dirname -- $0}/husky.sh'));
  fs.writeFileSync(commitMsgPath, commitMsgContent + '\nnpx --no --commitlint --edit $1\n');
  console.log(chalk.green('commit-msg添加成功'));

  //配置package.json 添加husky lint-staged
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJsonContent = fs.readJsonSync(packageJsonPath);
  packageJsonContent.husky = {
    hooks: {
      'pre-commit': 'lint-staged',
    },
  };
  packageJsonContent['lint-staged'] = {
    '*.{js,ts,tsx,jsx}': ['eslint --fix', 'prettier --write', 'git add'],
  };
  fs.writeJsonSync(packageJsonPath, packageJsonContent, { spaces: 2 });
  console.log(chalk.green('husky lint-staged配置成功'));
  console.log();
  console.log(chalk.green('所有插件配置完成，可以愉快的写代码了'));
}
module.exports = { init };

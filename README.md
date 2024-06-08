## 一键husky + eslint +prettier + commitlint安装脚本

### 第一次写脚本，无论是代码功底还是逻辑功底，都多有不足，还请各位多多包涵。包库中如有不足之处，还请多多指教！

使用：

首先在自己的项目package.json中的scripts添加

````
scripts:{
"your_name":"plugins"
}
```
````

然后运行npm run your_name

请注意，因为仓库中所有的命令是通过yarn来启动，所以有可能导致安装脚本后，用其他的如：pnpm/npm/cnpm 导致出现错误。

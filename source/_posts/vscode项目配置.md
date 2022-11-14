---
title: 'vscode配置'
cover: /assets/images/14316_46673790805.webp
tags: vscode
categories: vscode
---


## eslint

### 配置自动格式化

setting.json

```json
{
    "eslint.autoFixOnSave": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        {
            "language": "html",
            "autoFix": true
        },
        {
            "language": "vue",
            "autoFix": true
        }
    ],
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}

```

### 忽略eslint 校验

```
使用  // eslint-disable-next-line 忽略下一行的ESLint校验  
使用 /* eslint-disable */ 忽略文件中的所有ESLint校验。 
```

### eslint在 vue中显示错误

vue.config.js 配置 eslint-loader

```js
chainWebpack: config => {
  // ESLint 强制校验，开启后如果ESLint校验不通过，则运行不起来。错误也将显示在浏览器页面上
  config.module
    .rule('eslint')
    .include.add(path.resolve(__dirname, './src')).end()
    .exclude.add(path.resolve(__dirname, './src/assets')).end()
    .exclude.add(path.resolve(__dirname, './src/styles')).end()
    .exclude.add(path.resolve(__dirname, './dist')).end()
    .use('eslint')
    .loader('eslint-loader')
    .tap(options => options);
},
```
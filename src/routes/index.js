const fs = require('fs')

//读取当前目录下除 index.js 的所有文件，并注入到router中去

module.exports = function(app){
    const files = fs.readdirSync(__dirname)
    files.forEach((file) => {
        if(file === 'index.js') return;
        const route = require(`./${file}`)
        app.use(route.routes()).use(route.allowedMethods())
    })
}


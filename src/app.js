const Koa = require('koa')
const app = new Koa()
const koaBody = require('koa-body')({
    multipart: true, // 允许上传多个文件
})
const koajwt = require('koa-jwt')
const logger = require('./logger')
const router = require('./routes/index')

//对访问客户端进行token验证
// 1.1错误处理
app.use((ctx, next) => {
    return next().catch((err) => {
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    })
})
// 1.2验证请求是否授权 添加后除 unless 指定的路由外，都需要授权
// app.use(koajwt({
//     secret: 'my_token'
// }).unless({
//     path: [/\/register/, /\/login/]
// }));
app.use(koaBody)
app.use(logger)
router(app)



app.listen(3000, () => {
    console.log('running at localhost:3000')
})
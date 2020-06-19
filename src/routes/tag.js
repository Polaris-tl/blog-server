const Router = require('koa-router')
const router = new Router()
const {getTags} = require('../controller/tag')

router.get('/tag',getTags)
module.exports = router
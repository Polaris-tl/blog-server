const Router = require('koa-router')
const koajwt = require('koa-jwt')
const {getComment,getChildComment,addComment} = require('../controller/comment')
const router = new Router()

//验证是否授权
const auth = koajwt({
    'secret': "my_token"
})
//验证是是否是本id
const checkOwner = async (ctx,next) => {
    if(ctx.request.body.uid != ctx.state.user.id){
        ctx.throw(401,'您没有权限')
    }
    await next()
}

router.get('/comment',getComment)
router.get('/child_comment',getChildComment)
router.post('/add_comment',auth,checkOwner,addComment)

module.exports = router
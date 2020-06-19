const Router = require("koa-router")
const koajwt = require('koa-jwt');
const {getUser,login,register,getOtherUser,getUserList,deleteUser,modifyUser} = require('../controller/user')
const router = new Router()

//验证是否授权
const auth = koajwt({
    'secret': "my_token"
})
//验证是是否是本id
const checkOwner = async (ctx,next) => {
    if(ctx.params.id != ctx.state.user.id){
        ctx.throw(401,'您没有权限')
    }
    await next()
}
//超级用户权限
const withSuper = async (ctx,next) => {
    if(ctx.state.user.role != 'superAdmin'){
        ctx.throw(401,'您没有权限')
    }
    await next()
}
//管理员权限
const withAdmin = async (ctx,next) => {
    if(ctx.state.user.role != 'admin'){
        ctx.throw(401,'您没有权限')
    }
    await next()
}

router.post('/login', login);
router.post('/register', register);
router.get('/user/:id', auth,checkOwner, getUser);
router.get('/otherUser/:id', auth, getOtherUser);

router.post('/get_user_list', auth, withSuper,getUserList);
router.post('/delete_user', auth, withSuper,deleteUser);
router.post('/modify_user', auth, withSuper,modifyUser);



module.exports = router
const jwt = require('jsonwebtoken')
const {
    Sequelize,
    DataTypes
} = require("sequelize")
const config = require('../config/dbConfig')
const sequelize = new Sequelize(config.DB_NAME, config.USERNAME, config.PASSWORD, config.OTHER);

const User = sequelize.define('user', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    avatar_url: {
        type: DataTypes.STRING,
        defaultValue: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    nick_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    job: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    star_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    view_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comment_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    word:{
        type: DataTypes.STRING,
        defaultValue: null
    },
    github: {
        type: DataTypes.STRING,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('normal', 'admin', 'superAdmin'),
        defaultValue: 'normal'
    },
})
const Article = sequelize.define('article', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    content_md: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    abstract: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    comment_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    like_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cates',
            key: 'id',
        },
    },
    view_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
})
// 得到文章的浏览数
const getViewNum = async function(id){
     return await Article.findAll({
         raw:true,
        where:{uid:id}
    }).then((res) => {
        // return res
        return res.reduce((total, currentValue,) => {
            //第一次ruduce计算后total将变成一个数字，不在是对象形式
            return total.view_num ? total.view_num + currentValue.view_num : total + currentValue.view_num
        })
    })
}
// 得到文章的评论数
const getCommentNum = async function(id){
    return await Article.findAll({
        raw:true,
       where:{uid:id}
   }).then((res) => {
       // return res
       return res.reduce((total, currentValue,) => {
           //第一次ruduce计算后total将变成一个数字，不在是对象形式
           return total.comment_num ? total.comment_num + currentValue.comment_num : total + currentValue.comment_num
       })
   })
}
// 得到谋篇文章的点赞数
const getStartNum = async function(id){
    return await Article.findAll({
        raw:true,
       where:{uid:id}
   }).then((res) => {
       // return res
       return res.reduce((total, currentValue,) => {
           //第一次ruduce计算后total将变成一个数字，不在是对象形式
           return total.like_num ? total.like_num + currentValue.like_num : total + currentValue.like_num
       })
   })
}
class userCtrl {
    //登录
    async login(ctx, next) {
        let {
            username,
            password
        } = ctx.request.body

        await User.findOne({
            raw: true,
            where: {
                username
            }
        }).then(async (result) => {
            if (result.password == password) {
                //设置token
                const token = jwt.sign({
                    name: result.username,
                    id: result.id,
                    role: result.role
                }, 'my_token', {
                    expiresIn: '2h'
                });
                //进行鉴权之后，可以通过 ctx.state.user 来获取上面刚传入的name,id,role 等字段
                const view_num = await getViewNum(result.id)
                const comment_num = await getCommentNum(result.id)
                const star_num = await getStartNum(result.id)
                ctx.response.body = {
                    token: token,
                    data: {
                        ...result,
                        password: '',
                        view_num,
                        comment_num,
                        star_num
                    },
                    status: 200,
                    message: 'OK'
                };
            } else {
                ctx.response.body = {
                    status: 300,
                    message: '密码错误'
                };
            }
        }).catch((err) => {
            ctx.response.body = {
                status: 400,
                message: '密码错误'
            };;
        })
    }
    //获取用户本人的信息 
    async getUser(ctx) {
        let {id} = ctx.params
        await User.findOne({
            raw: true,
            where: {
                id
            }
        }).then(async (result) => {
            const view_num = await getViewNum(result.id)
            const comment_num = await getCommentNum(result.id)
            const star_num = await getStartNum(result.id)
            ctx.response.body = {
                data: {
                    ...result,
                    view_num,
                    comment_num,
                    star_num
                },
                status: 200,
                message: 'OK'
            }
        }).catch(() => {
            ctx.response.body = {
                status: 400,
                message: '密码错误'
            };
        })
    }
    //获取其他用户的信息 
    async getOtherUser(ctx) {
        let {id} = ctx.params
        await User.findOne({
            raw: true,
            where: {
                id
            },
            attributes:['id','star_num','job','nick_name','avatar_url','github','view_num','comment_num','username','word']
        }).then(async (result) => {
            const view_num = await getViewNum(result.id)
            const comment_num = await getCommentNum(result.id)
            const star_num = await getStartNum(result.id)
            ctx.response.body = {
                data: {
                    ...result,
                    view_num,
                    comment_num,
                    star_num
                },
                status: 200,
                message: 'OK'
            }
        }).catch(() => {
            ctx.response.body = {
                status: 400,
                message: '密码错误'
            };
        })
    }
    // 注册
    async register(ctx) {
        const {
            username,
            password,
            nick_name
        } = ctx.request.body
        const res = await User.findOne({
            where: {
                username
            }
        })
        if (!res) {
            await User.create({
                username,
                password,
                nick_name
            }).then((result) => {
                ctx.response.body = {
                    status: 200,
                    message: 'OK'
                };
            }).catch((error) => {
                ctx.response.body = {
                    status: 300,
                    message: 'NOT OK'
                };
            })
        } else {
            ctx.response.body = {
                status: 400,
                message: '用户已注册'
            }
        }

    }
    //获取用户列表
    async getUserList(ctx){
        ctx.response.body = {
            status:200,
            message:'Ok'
        }
    }
    //删除用户
    async deleteUser(ctx){
        const {id} = ctx.request.body
        ctx.response.body = {
            id,
            status:200,
            message:'Ok'
        }
    }
    //修改用户
    async modifyUser(ctx){
        const {id} = ctx.request.body
        ctx.response.body = {
            id,
            modify:'llll',
            status:200,
            message:'Ok'
        }
    }
    
}
module.exports = new userCtrl()
const {
    Sequelize,
    DataTypes
} = require("sequelize")
const config = require('../config/dbConfig')

const sequelize = new Sequelize(config.DB_NAME, config.USERNAME, config.PASSWORD, config.OTHER);

const Comment = sequelize.define('comment', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'articles',
            key: 'id',
        },
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
    },
    like_num: {
        type: DataTypes.INTEGER,
    },
    reply_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
    },
})

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
    comment_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
})

async function insertUser(res) {
    const user_Promise = res.rows.map(async (item) => {
        return await User.findOne({
            where: {
                id: item.uid
            },
            attributes: ['id', 'nick_name', 'avatar_url']
        }).then((res) => {
            return {
                ...item,
                user: res
            }
        })

    })
    return await Promise.all(user_Promise)
}
async function checkHasChild(res) {
    const child_promise = res.rows.map(async (item) => {
        return await Comment.findAndCountAll({
            where: {
                parent_id: item.id
            }
        }).then((res) => {
            return {
                ...item,
                child_num: res.count
            }

        })
    })
    return await Promise.all(child_promise)
}

async function insertUser222(res) {
    const user_Promise = res.map(async (item) => {
        return await User.findOne({
            where: {
                id: item.uid
            },
            attributes: ['id', 'nick_name', 'avatar_url']
        }).then((res) => {
            return {
                ...item,
                user: res
            }
        })

    })
    return await Promise.all(user_Promise)
}

class commentCtrl {
    //获取评论 ?page=1&a_id=5
    async getComment(ctx) {
        const {
            a_id,
            page
        } = ctx.query
        await Comment.findAndCountAll({
            raw: true,
            limit: 4,
            offset: (page - 1) * 4 || 0,
            where: {
                article_id: a_id,
                parent_id: null,
            },
            order: [
                ['createdAt', 'desc'],
            ]
        }).then(async (result) => {

            //检查该评论的子评论
            result.rows = await checkHasChild(result)
            //插入用户信息
            result.rows = await insertUser(result)

            ctx.response.body = {
                data: result,
                status: 200,
                message: 'OK'
            };
        }).catch((error) => {
            ctx.response.body = error;
        })
    }
    //获取子评论 ?parent_id=4&page=1
    async getChildComment(ctx) {
        const {
            parent_id,
            page
        } = ctx.query
        await Comment.findAll({
            raw: true,
            limit: 3,
            offset: (page - 1) * 3 || 0,
            where: {
                parent_id: parent_id
            }
        }).then(async (result) => {
            result = await insertUser222(result)
            ctx.response.body = {
                data: result,
                status: 200,
                message: 'OK'
            };
        }).catch((error) => {
            ctx.response.body = {
                err: error
            };
        })
    }
    //添加评论 post {uid,article_id,parent_id,content}
    async addComment(ctx) {
        const {
            uid,
            article_id,
            parent_id,
            content
        } = ctx.request.body
        await Article.increment('comment_num', {where: {id:article_id}})
        await Comment.create({
            uid,
            article_id,
            parent_id,
            content,
        }).then(async (res) => {
            const user = await User.findOne({
                raw: true,
                where: {
                    id: res.uid
                },
                attributes: ['id', 'avatar_url', 'nick_name']
            })

            ctx.response.body = {
                data: {
                    //注意 这里直接 写 ...res  会出现循环引用报错的问题，这里的解决办法为：先通过 stringify 转成字符串，再 parse 成一个新的对象
                    ...JSON.parse(JSON.stringify(res)),
                    user,
                    child_num: 0
                },
                status: 200,
                message: 'OK',
            }
        })
    }
}

module.exports = new commentCtrl()
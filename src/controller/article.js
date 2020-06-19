const jwt = require('jsonwebtoken')
const {
    Sequelize,
    DataTypes
} = require("sequelize")
const config = require('../config/dbConfig')
const sequelize = new Sequelize(config.DB_NAME, config.USERNAME, config.PASSWORD, config.OTHER);

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
    }
})

const Tag = sequelize.define('tags', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

const TagArticle = sequelize.define('tag_and_articles', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    tag_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'tags',
            key: 'id'
        },
        allowNull: false
    },
    article_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'tags',
            key: 'id'
        },
        allowNull: false
    }
})

const UserAndArticle = sequelize.define('userlike_and_articles', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    uid: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: false
    },
    article_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'articles',
            key: 'id'
        },
        allowNull: false
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

async function insertTag(res) {
    //1.先通过文章id在tag_and_articles表中查询这篇文章所对应的所有tag_id

    const tag_Promise = res.map(async (item) => {
        return await TagArticle.findAll({
            where: {
                article_id: item.id
            }
        }).then(async (res) => {
            //2.拿到这篇文章所有的tag_id后，接着在tag表中查询tag_id对应的类容
            const tag_ids = res.map(item2 => item2.tag_id)
            const last = await Tag.findAll({
                raw: true,
                where: {
                    id: tag_ids
                },
                attributes: ['id', 'name']
            }).then((res) => {
                return res
            })
            const tag = await Promise.all(last)
            return {
                ...item,
                tag
            }
        })

    })
    return await Promise.all(tag_Promise)
}

async function user(id) {
    return await User.findOne({
        where: {
            id
        },
        attributes: ['id', 'avatar_url', 'nick_name']
    })
}

class articleCtrl {
    //获取首页文章列表 ?page=
    async getArticleList(ctx) {
        const page = ctx.query.page || 0;
        await Article.findAndCountAll({
            limit: 5,
            offset: ((page - 1) * 5) || 0,
            raw: true,
            attributes: {
                exclude: ['content', 'updatedAt']
            }
        }).then(async (res) => {
            //保存数据总条数
            const count = res.count
            //传入user相关信息
            res = await insertUser(res)
            //传入tag相关信息
            res = await insertTag(res)

            ctx.response.body = {
                data: {
                    count,
                    rows: res
                },
                status: 200,
                message: 'OK'
            };
        }).catch((error) => {
            ctx.response.body = error;
        })
    }
    //获取某一文章详细信息
    async getArticleById(ctx) {
        const {
            id
        } = ctx.params;
        await Article.increment('view_num', {
            where: {
                id: id
            }
        })
        await Article.findOne({
            raw: true,
            where: {
                id: id
            },

        }).then(async (result) => {
            const userData = await user(result.uid)
            ctx.response.body = {
                data: {
                    ...result,
                    user: userData
                },
                status: 200,
                message: 'OK'
            };
        }).catch((error) => {
            ctx.response.body = error;
        })
    }
    //获取热门文章
    async getHotArticle(ctx) {
        await Article.findAll({
            where: {
                is_hot: 0
            },
            limit: 5,
            raw: true,
            attributes: ['title', 'id', 'like_num', 'comment_num', 'view_num', 'tag_id']
        }).then((result) => {
            ctx.response.body = {
                data: result,
                status: 200,
                message: 'OK'
            };
        }).catch((error) => {
            ctx.response.body = error;
        })
    }
    //用户是否喜欢这篇文章  ?uid=1&article_id=4
    async isUserLikeThisArticle(ctx) {
        const {
            uid,
            article_id
        } = ctx.query
        await UserAndArticle.findOne({
            where: {
                uid,
                article_id
            }
        }).then((res) => {
            ctx.response.body = {
                isLike: Boolean(res),
                status: 200,
                message: 'OK'
            }
        })

    }
    //用户点赞或者取消点赞这篇文章 ?uid=1&article_id=4
    async setLikeOrNotArticle(ctx) {
        const {
            uid,
            article_id
        } = ctx.query
        await UserAndArticle.findOne({
            where: {
                uid,
                article_id
            }
        }).then(async (res) => {
            if (res) {
                await Article.decrement('like_num', {
                    where: {
                        id: article_id
                    }
                })
                await UserAndArticle.destroy({
                    where: {
                        uid,
                        article_id
                    }
                }).then(() => {
                    ctx.response.body = {
                        isLike: false,
                        status: 200,
                        message: 'OK'
                    }
                })
            } else {
                await Article.increment('like_num', {
                    where: {
                        id: article_id
                    }
                })
                await UserAndArticle.create({
                    uid,
                    article_id
                }).then(() => {
                    ctx.response.body = {
                        isLike: true,
                        status: 200,
                        message: 'OK'
                    }
                })
            }
        })

    }
    // 获取某一用户的所有文章 page
    async getArticlesById(ctx) {
        const {
            page,
            uid
        } = ctx.request.body
        await Article.findAndCountAll({
            limit: 5,
            offset: ((page - 1) * 5) || 0,
            raw: true,
            where: {
                uid,
            }
        }).then(async (res) => {
            // //保存数据总条数
            const count = res.count
            // //传入user相关信息
            res = await insertUser(res)
            // //传入tag相关信息
            res = await insertTag(res)
            ctx.response.body = {
                data: {
                    count,
                    rows: res
                },
                status: 200,
                message: 'OK'
            };
        })

    }
}
module.exports = new articleCtrl()
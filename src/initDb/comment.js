/*
 * @Author: your name
 * @Date: 2020-06-08 10:54:45
 * @LastEditTime: 2020-06-08 15:54:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mysql\src\initDb\comment.js
 */ 
const {
    Sequelize,
    DataTypes
} = require('sequelize')
const config = require('../config/dbConfig')
const sequelize = new Sequelize(config.DB_NAME, config.USERNAME, config.PASSWORD, config.OTHER);



const Option = sequelize.define('comment', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    uid:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    article_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: 'articles',
            key: 'id',
        },
    },
    content:{
        type:DataTypes.STRING,
        allowNull:false
    },
    parent_id:{
        type:DataTypes.INTEGER,
    },
    like_num:{
        type:DataTypes.INTEGER,
    },
    reply_num:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
})


const foo = async () => {
    await sequelize.sync()
    Option.create({
        id:1,
        uid:2,
        article_id:5,
        content:'我是评论'
    })
}

foo()
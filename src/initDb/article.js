/*
 * @Author: your name
 * @Date: 2020-06-02 10:14:41
 * @LastEditTime: 2020-06-07 16:14:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mysql\add.js
 */


const {
    Sequelize,
    DataTypes
} = require('sequelize')
const config = require('../config/dbConfig')
const sequelize = new Sequelize(config.DB_NAME, config.USERNAME, config.PASSWORD, config.OTHER);
const data = require('./article-data')


const Option = sequelize.define('article', {
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
    is_hot:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
})


const foo = async () => {
    await sequelize.sync()
    data.map((item) => {
        Option.create({
            title: item.title,
            uid: item.uid,
            content: item.content,
            abstract: item.abstract,
            comment_num: item.comment_num,
            create_time: item.create_time,
            like_num: item.like_num,
            tag_id: item.tag_id,
            cate_id: item.cate_id,
            view_num: item.view_num
        })
    })
}

foo()
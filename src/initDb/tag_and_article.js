/*
 * @Author: your name
 * @Date: 2020-06-02 10:14:41
 * @LastEditTime: 2020-06-09 11:19:46
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



const Option = sequelize.define('tag_and_article', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    tag_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: 'tags',
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
})


const foo = async () => {
    await sequelize.sync()
}

foo()
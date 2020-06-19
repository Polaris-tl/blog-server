/*
 * @Author: your name
 * @Date: 2020-06-02 10:14:41
 * @LastEditTime: 2020-06-02 16:36:14
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



const Option = sequelize.define('cate', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    en_name:{
        type:DataTypes.STRING,
        allowNull:false
    }
})


const foo = async () => {
    await sequelize.sync()
    Option.create({
        name:'前端',
        en_name:'front'
    })
    Option.create({
        name:'后端',
        en_name:'back'
    })
}

foo()
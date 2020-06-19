/*
 * @Author: your name
 * @Date: 2020-06-02 10:14:41
 * @LastEditTime: 2020-06-04 16:04:14
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



const Option = sequelize.define('user', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    avatar_url:{
        type:DataTypes.STRING,
        defaultValue:'http://b-ssl.duitang.com/uploads/item/201512/14/20151214104025_NytJX.jpeg'
    },
    nick_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    job:{
        type:DataTypes.STRING,
        defaultValue:null
    },
    star_num:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    view_num:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    comment_num:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    github:{
        type:DataTypes.STRING,
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role:{
        type:DataTypes.ENUM('normal','admin','superAdmin'),
        defaultValue:'normal'
    },
})


const foo = async () => {
    await sequelize.sync()
    Option.create({
        nick_name:'唐铃'
    })
    Option.create({
        nick_name:'冉程霞'
    })
}

foo()
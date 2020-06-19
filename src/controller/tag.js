const {Sequelize,DataTypes} = require('sequelize')
const {DB_NAME,USERNAME,PASSWORD,OTHER} = require('../config/dbConfig')
const sequelize = new Sequelize(DB_NAME,USERNAME,PASSWORD,OTHER)

const Tags = sequelize.define('tags',{
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
})

class tagCtrl {
    //获取所有tag
    async getTags(ctx){
        await Tags.findAll({
            raw:true,
            attributes:['id','name']
        }).then((res) => {
            ctx.response.body = {
                data:res,
                status:200,
                message:'Ok'
            }
        })
    }
}

module.exports = new tagCtrl()
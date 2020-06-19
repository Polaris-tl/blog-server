const {Sequelize,DataTypes} = require("sequelize")

const config = require('./config/dbConfig')

const sequelize = new Sequelize(config.DB_NAME, config.USERNAME,config.PASSWORD, config.OTHER);

const Test = sequelize.define('logger', {
    method: DataTypes.STRING,
    url:DataTypes.STRING,
    responseTime:DataTypes.STRING,
    ip: DataTypes.STRING,
    visitTimes:{
        type:DataTypes.INTEGER,
        defaultValue:0
    }
})

const getUserIp = (req) => {
    return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  }

async function logger(ctx, next){
    const start = Date.now()
    const userIp = getUserIp(ctx.req)
    await next();
    const ms = Date.now() - start;
    await Test.findOne({
        where:{
            ip:userIp
        }
    }).then((res)=>{
        const newVisitTimes = res.visitTimes + 1
        Test.update({
            visitTimes:newVisitTimes
        },{
            where:{
                ip:userIp
            }
        })
    }).catch(()=>{
        Test.create({
            'method':ctx.method,
            'url':ctx.url,
            'responseTime':ms,
            'ip':userIp,
            'visitTimes':0
        })
    })
}



module.exports = logger
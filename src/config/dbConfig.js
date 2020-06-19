/*
 * @Author: your name
 * @Date: 2020-06-02 15:15:12
 * @LastEditTime: 2020-06-02 16:47:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \mysql\config\daConfig.js
 */

'use strict';
module.exports = {
    DB_NAME: 'test',
    USERNAME: 'root', // 用户名
    PASSWORD: 'mysql123', // 密码
    OTHER: {
        host: 'localhost', //  接数据库的主机
        port: '3306', //  接数据库的端口
        protocol: 'tcp', //  连接数据库使用的协议
        dialect: 'mysql', //  使用mysql
        pool: {
            max: 5, //  最大连接数量
            min: 0, //  最小连接数量
            idle: 10000 //  连接空置时间（毫秒），超时后将释放连接
        },
        retry: { //  设置自动查询时的重试标志
            max: 1//  设置重试次数
        },
        omitNull: false, //  null 是否通过SQL语句查询
        timezone: '+08:00' //  解决时差 - 默认存储时间存在8小时误差
    },

};
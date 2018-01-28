/**
 * Created by zgw on 2017/3/20.
 */
const Sequelize = require('sequelize');
const dbconfig = require('./dbconfig');
console.log('init sequelize...');

const sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, {
    host: dbconfig.host,
    port: dbconfig.port,
    dialect: dbconfig.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    timezone: '+08:00'
});

module.exports = sequelize;
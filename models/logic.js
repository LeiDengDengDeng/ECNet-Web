/**
 * Created by apple on 2017/4/13.
 */
const sequelize = require("./sequelize.js");
const Sequelize = require('sequelize');  //这个是为了使用Sequelize里提供的各种静态数据类型DataTypes

const Logic = sequelize.define('logic', {
    title: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '标题'
    },description: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '简介'
    },caseReason: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '案由'
    },caseNumber: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '案号'
    }
}, {
    // 自定义表名
    'freezeTableName': true,
    'tableName': 'logic',
    'charset': 'utf8',
    'collate': 'utf8_general_ci',
    'comment': '逻辑图图元',
    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': true,
    // 同时需要设置paranoid为true（此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
    // 'deletedAt': 'dtime',
    'paranoid': true,

});

Logic.sync(
    {force: true}
); //创建表

module.exports = Logic;
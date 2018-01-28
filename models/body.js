/**
 * Created by zgw on 2017/3/29.
 */
const sequelize = require("./sequelize.js");
const Sequelize = require('sequelize');  //这个是为了使用Sequelize里提供的各种静态数据类型DataTypes

const Body = sequelize.define('body', {
    name: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '证据名称'
    },
    evidenceType: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '证据类型'
    },
    committer: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '提交人'
    },
    evidenceReason: {
        type: Sequelize.STRING(100),
        defaultValue: 0,
        allowNull: false,
        comment: '质证理由'
    },
    evidenceConclusion: {
        type: Sequelize.STRING(100),
        defaultValue: 0,
        allowNull: false,
        comment: '质证结论'
    },
    content: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '证据明细'
    },
    relativeID: {
        type: Sequelize.INTEGER,
        defaultValue: -1, // 相对id从0开始
        allowNull: false,
        comment: '相对id,即在具体证据链集中的id，区别于全局id'
    },
    ecmID: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: '证据链集id'
    },

}, {
    // 自定义表名
    'freezeTableName': true,
    'tableName': 'body',
    'charset': 'utf8',
    'collate': 'utf8_general_ci',
    'comment': '链体',
    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': true,
    // 同时需要设置paranoid为true（此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
    // 'deletedAt': 'dtime',
    'paranoid': true,

});

Body.sync(
    {force: true}
); //创建表

module.exports = Body;






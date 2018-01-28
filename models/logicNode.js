/**
 * Created by apple on 2017/4/13.
 */
const sequelize = require("./sequelize.js");
const Sequelize = require('sequelize');  //这个是为了使用Sequelize里提供的各种静态数据类型DataTypes

const LogicNode = sequelize.define('logic_node', {
    topic: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '摘要'
    },
    type: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '类型'
    },
    detail: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '详情'
    },
    leadTo: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'parent ID'
    },
    logicID: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: '逻辑图集id'
    },
    relativeID: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: '相对id'
    }
}, {
    // 自定义表名
    'freezeTableName': true,
    'tableName': 'logic_node',
    'charset': 'utf8',
    'collate': 'utf8_general_ci',
    'comment': '逻辑图图元',
    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': true,
    // 同时需要设置paranoid为true（此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
    // 'deletedAt': 'dtime',
    'paranoid': true,

});

LogicNode.sync(
    {force: true}
); //创建表

module.exports = LogicNode;
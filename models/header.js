/**
 * Created by zgw on 2017/3/29.
 */
const sequelize = require("./sequelize.js");
const Sequelize = require('sequelize');  //这个是为了使用Sequelize里提供的各种静态数据类型DataTypes

const Header = sequelize.define('header', {
    name: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '链头名称'
    },
    keySentence: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '关键文本'
    },
    content: {
        type: Sequelize.STRING(100),
        defaultValue: '',
        allowNull: false,
        comment: '链头内容'
    },
    ownerID: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: '链头相对id，0表示没有链头'
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
    }

}, {
    // 自定义表名
    'freezeTableName': true,
    'tableName': 'header',
    'charset': 'utf8',
    'collate': 'utf8_general_ci',
    'comment': '链头',
    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': true,
    // 同时需要设置paranoid为true（此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
    // 'deletedAt': 'dtime',
    'paranoid': true,

});

Header.sync(
    {force: true}
); //创建表

module.exports = Header;






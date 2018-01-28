/**
 * Created by zgw on 2017/3/30.
 * 事务模板
 */
const Sequelize = require('sequelize');
const cls = require('continuation-local-storage');
const namespace = Sequelize.cls = cls.createNamespace('ecm');
const db = require('./sequelize');

const trans = async(operation) => {
    let t = namespace.get('transaction');
    let hasTrans = !!t;
    t = t || await db.transaction();
    try {
        let result = await operation.apply(null, arguments);
        if (!hasTrans) await t.commit();
        return result;
    }
    catch (e) {
        if (!hasTrans) await t.rollback();
        throw e;
    }
};


module.exports = trans;
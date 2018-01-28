const sydb = require('./connect');

exports.updateNode_s = (nodes, ecmId, qs) => {
    const deleteSql = `DELETE FROM MOD_LOGIC_NODE WHERE logicID=${ecmId}`;
    qs.query(deleteSql);
    for (const i in nodes) {
        const item = nodes[i];
        const insertsql = `INSERT INTO MOD_LOGIC_NODE (topic, type, detail, leadTo, logicID, relativeID) VALUES ('${item.topic}','${item.type}','${item.detail}',${item.leadTo},${ecmId},${item.relativeID})`;
        qs.query(insertsql);
    }
};
exports.getNodesList = async (id) => {
    const sql = `SELECT *
FROM MOD_LOGIC_NODE WHERE logicID = ${id}`;
    const res = await sydb.p_select(sql);
    return res;
};
exports.deleteNode = async (ecmId)=>{
    const sql = `DELETE FROM MOD_LOGIC_NODE WHERE logicID=${ecmId}`
    const c =await sydb.p_update(sql)
    console.log(`${sql} EXECUTED ${c} row(s) effected`)
}
const sydb = require('./connect');
exports.sqlToExecute = (sqlList,q_set)=>{
    for (let sql in sqlList)
    {q_set.query(sqlList[sql])}
}
exports.deleteByECMId = async (ecmID)=> {
    const sql = `DELETE FROM MOD_BODY WHERE ecmID=${ecmID}`;
    const res = sydb.p_update(sql);
    if (res.length == 0) {
        return null;
    }
    return res[0];
}
function insertSQL(bodys, ecmId) {
    let sql = '';
    for (const body in bodys) {
        console.log(body);
        const item = bodys[body];
        item.ecmID = ecmId;
        item.relativeID = item.$.id || -1;
        sql += `INSERT INTO MOD_BODY (name, evidenceType,committer,evidenceReason,evidenceConclusion,content, relativeID, ecmID) VALUES ('${item.name}','${item.evidenceType}','${item.committer}','${item.evidenceReason}','${item.evidenceConclusion}','${item.content}', ${item.relativeID},${item.ecmID}) `;
    }
    return sql;
}
function deleteSQL(ecmId) {
    return `DELETE FROM MOD_BODY WHERE ecmID=${ecmId}`;
}
exports.updateBody_s = (eles, ecmId, query_s) => {
    const deleteSql = deleteSQL(ecmId);
    const insertSql = insertSQL(eles, ecmId);
    this.sqlToExecute([deleteSql, insertSql], query_s);
};
exports.updateBody = async (bodys, ecmId) => {
    const count = await deleteByECMId(ecmId);
    if (count == 0) {
        console.log('No body found');
    } else {
        console.log(`${count} body(s) deleted`);
    }

    const sql = insertSQL(bodys, ecmId);
    const c = sydb.p_update(sql);
    console.log(`update bodies finished ${c} rows effected`);
};
// 根据ecmID查找所有的body


exports.findByECMId = async (ecmID) => {
    const sql = `SELECT *
FROM MOD_BODY WHERE ecmID=${ecmID}`;
    const res =await  sydb.p_select(sql);
    if (res.length > 0) {
        return res;
    }
    return [];
};

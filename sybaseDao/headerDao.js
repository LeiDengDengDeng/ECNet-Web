const sydb = require('./connect');

exports.sqlToExecute = (sqlList, q_set) => {
    for (const sql in sqlList) { q_set.query(sqlList[sql]); }
};
function ele_filter(ele){
    ele.forEach((t) => {
        if (!t.ownerID) {
            t.ownerID = 0;
        }
    });

    return ele;
};


function insertSQL(headers, ecmId) {
    let sql = '';
    headers = ele_filter(headers||[]);
    for (const header in headers) {
        console.log(header);

        const item = headers[header];
        item.ecmID = ecmId;
        item.relativeID = item.$.id || -1;
        sql += `INSERT INTO MOD_HEADER (name, keySentence, content, ownerID, relativeID, ecmID) VALUES('${item.name}','${item.keySentence}','${item.content}',${item.ownerID} , ${item.relativeID},${item.ecmID}) `;
    }
    return sql;
}
function deleteSQL(ecmId) {
    return `DELETE FROM MOD_HEADER WHERE ecmID=${ecmId}`;
}
exports.updateHeader_s = (eles, ecmId, query_s) => {
    const deleteSql = deleteSQL(ecmId);
    const insertSql = insertSQL(eles, ecmId);
    this.sqlToExecute([deleteSql, insertSql], query_s);
};
exports.deleteByECMId = async (ecmID) => {
    const sql = `DELETE FROM MOD_HEADER WHERE ecmID=${ecmID}`;
    const res = sydb.p_update(sql);
    if (res.length == 0) {
        return null;
    }
    return res[0];
};
exports.updateHeader = async (headers, ecmId) => {
    let count = await deleteByECMId(ecmId);
    if (count == 0) {
        console.log('No headers found');
    } else {
        console.log(`${count} headers deleted`);
    }

    const sql = insertSQL(headers, ecmId);
    count = sydb.p_update(sql);
    console.log(`update headers finished ${count} rows effected`);
};
// 根据ecmID查找所有的header


exports.findByECMId = async (ecmID) => {
    const sql = `SELECT *
FROM MOD_HEADER WHERE ecmID=${ecmID}`;
    const res = await sydb.p_select(sql);
    if (res.length > 0) {
        return res;
    }
    return [];
};

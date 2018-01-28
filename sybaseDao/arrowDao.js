/**
 * Created by zsm on 2017/8/15
 */


const sydb = require('./connect');


function ele_filter (arrows){

    arrows.forEach(t => {
        if(!t.sonID){
            t.sonID = 0;
        }
        if(!t.ownerID){
            t.ownerID = 0;
        }
    });

    return arrows;
};

exports.sqlToExecute = (sqlList,q_set)=>{
    for (let sql in sqlList)
    {q_set.query(sqlList[sql])}
}

function insertSQL (arrows,ecmId){
    arrows = ele_filter(arrows||[])
    let  sql = ``
    for (let arrow in arrows){
        console.log(arrow)

        let item = arrows[arrow]

        item.ecmID = ecmId
        item.relativeID = item.$.id||-1
        sql += `INSERT INTO MOD_ARROW (name, content, ownerID, sonID, relativeID, ecmID) VALUES ('${item.name}','${item.content}',${item.ownerID} , ${item.sonID}, ${item.relativeID},${item.ecmID}) `
    }
    return sql
}
function deleteSQL(ecmId) {
    return  `DELETE FROM MOD_ARROW WHERE ecmID=${ecmId}`
}
exports.updateArrow_s =  (arrows,ecmId,query_s)=>{
    const deleteSql = deleteSQL(ecmId)
    const insertSql = insertSQL(arrows,ecmId)
    this.sqlToExecute([deleteSql,insertSql],query_s)
}
exports.deleteByECMId = async (ecmID)=>{
    const  sql = `DELETE FROM MOD_ARROW WHERE ecmID=${ecmID}`
    const res = sydb.p_update(sql)
    if (res.length==0){
        return null
    }else {
        return res[0]
    }

};
exports.updateArrow = async (arrows,ecmId)=>{
    let  count = await deleteByECMId(ecmId)
    if (count == 0){
        console.log('No arrow found')
    }else {
        console.log(`${count} arrows deleted`)
    }

    arrows = this.arrowFilter(arrows)
    const sql = insertSQL(arrows,ecmId)
    count = sydb.p_update(sql)
    console.log(`update arrows finished ${count} rows effected`)
}
// 根据ecmID查找所有的arrow


exports.findByECMId = async(ecmID) =>{
    const sql = `SELECT *
FROM MOD_ARROW WHERE ecmID=${ecmID}`
    const res = await sydb.p_select(sql)
    if(res.length>0){
        return res
    }else {
        return []
    }

}

const sydb = require('./connect')
exports.sqlToExecute = (sqlList,q_set)=>{
    for (let sql in sqlList)
    {q_set.query(sqlList[sql])}
}
function ele_filter(ele){

    ele.forEach(t => {
        if(!t.ownerID){
            t.ownerID = 0;
        }
    });

    return ele;
};
exports.deleteByECMId = async (ecmID)=>{
    const  sql = `DELETE FROM MOD_JOINT WHERE ecmID=${ecmID}`
    const res = sydb.p_update(sql)
    if (res.length==0){
        return null
    }else {
        return res[0]
    }

};
function insertSQL (joints,ecmId){
    joints = ele_filter(joints||[])
    let  sql = ``
    let  isStart = true
    for (let joint in joints){
        console.log(joint)
        let item = joints[joint]
        item.ecmID = ecmId
        item.relativeID = item.$.id||-1
        sql += `INSERT INTO MOD_JOINT (name, content, relativeID, ecmID) VALUES('${item.name}','${item.content}',${item.relativeID},${item.ecmID}) `
    }
    return sql
}
function deleteSQL(ecmId) {
    return  `DELETE FROM MOD_JOINT WHERE ecmID=${ecmId}`
}
exports.updateJoint_s =  (joints,ecmId,query_s)=>{
    const deleteSql = deleteSQL(ecmId)
    const insertSql = insertSQL(joints,ecmId)
    this.sqlToExecute([deleteSql,insertSql],query_s)
}
exports.updateJoint = async (joints,ecmId)=>{
    let  count = await deleteByECMId(ecmId)
    if (count == 0){
        console.log('No joint found')
    }else {
        console.log(`${count} joints deleted`)
    }

    const sql = updateSQL(joints,ecmId)
    count = sydb.p_update(sql)
    console.log(`update joints finished ${count} rows effected`)
}
// 根据ecmID查找所有的joint


exports.findByECMId = async(ecmID) =>{
    const sql = `SELECT *
FROM MOD_JOINT WHERE ecmID=${ecmID}`
    const res =await  sydb.p_select(sql)
    if(res.length>0){
        return res
    }else {
        return []
    }

}

const syb = require('./connect');

exports.createLOGIC = async (id, title, desc, caseReason, caseNumber,user,courtClerk,datestart,dateend) => {
    let ds = ''
    if (!datestart)
    {
        var d = new Date()
        ds = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()
    }else {
        ds = datestart
    }
    let de = 'NULL'
    if (dateend)
    {
        de = `'${dateend}'`
    }
    const sql = `INSERT INTO MOD_LOGIC (id, title, description, caseReason, caseNumber, manageJudge,courtClerk, startDate, endDate) VALUES (${id},'${title}','${desc}','${caseReason}','${caseNumber}','${user}','${courtClerk}','${ds}', ${de})`;
    const count = await syb.p_update(sql);
    return count;
};

exports.updateLOGIC = async (id, title, desc, caseReason, caseNumber,user,courtClerk,datestart,dateend) => {
    // chain all your queries here. make sure you return them.
    let us =''
    if(user)
    {
        us = `,
        manageJudge = '${user}'`
    }
    let cc = ''
    if(courtClerk)
    {
        cc = `,
        courtClerk = '${courtClerk}'`
    }
    let ds = ''
    if (datestart)
    {
        let sql = `SELECT LARQ
FROM PUB_AJ_JB WHERE AJXH ='${id}'`
        const d_s = await syb.p_select(sql)
        ds = `,
        startDate = '${d_s}'`

    }
    let de = ''
    if (dateend)
    {
        de = `,
        endDate = '${dateend}'`
    }

    const sql = `
    UPDATE MOD_LOGIC
    SET title = '${title}',
        description = '${desc}',
        caseReason = '${caseReason}',
        caseNumber = '${caseNumber}'${us} ${cc} ${ds} ${de}
    WHERE id= ${id}`;
    const count = await syb.p_update(sql);
    return count;
};

exports.deleteLOGIC = async (id) => {
    // chain all your queries here. make sure you return them.
    const sql = `DELETE FROM MOD_LOGIC WHERE id=${id}`;
    const count = await syb.p_update(sql);
    return count;
};

exports.findLOGICById = async (id) => {
    // chain all your queries here. make sure you return them.
    const sql = `SELECT * FROM MOD_LOGIC WHERE id= ${id}`;
    const res = await syb.p_select(sql);
    if (res.length != 0) {
        return res[0];
    } else {
        return null;
    }
};
exports.findLOGICByIdInRaw = async (id) => {
    // chain all your queries here. make sure you return them.
    const sql = `SELECT * FROM PUB_AJ_JB WHERE AJXH=${id}`;
    const sql_spry = `SELECT * FROM PUB_SPRY WHERE AJXH=${id} AND (SFCBR='Y' OR FG = '0')`;
    const res = await syb.p_select(sql);
    const res_spry = await syb.p_select(sql_spry);
    if (res.length != 0) {
        const acase = {
            id: res[0].AJXH,
            title: res[0].AJMC,
            caseNumber: res[0].AH,
            caseDate: res[0].LARQ,
        };
        for (const item in res_spry) {
            if (res_spry[item].FG == '0') { acase.courtClerk = res_spry[item].XM; } else { acase.manageJudge = res_spry[item].XM; }
        }
        return acase;
    }
    return null;
};


exports.findLOGICList = async (name) => {
    // chain all your queries here. make sure you return them.
    const sql = `SELECT * FROM MOD_LOGIC WHERE id in (SELECT AJXH FROM PUB_SPRY WHERE XM = '${name}') `;
    const data = await syb.p_select(sql);
    let dv = []
    for (let i in data)
    {
        dv.push({
            id: data[i].id,
            caseId : data[i].caseNumber,
            caseTitle: data[i].title,
            manageJudge: data[i].manageJudge,
            caseDate: data[i].startDate
        })
    }

    return dv;
};


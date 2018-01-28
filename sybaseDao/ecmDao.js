const syb = require('./connect');

exports.createECM = async (id, title, desc, caseReason, caseNumber, user, courtClerk,datestart, dateend) => {
    let ds = '';
    if (!datestart) {
        const d = new Date();
        ds = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    } else {
        ds = datestart;
    }
    let de = 'NULL';
    if (dateend) {
        de = `'${dateend}'`;
    }
    const sql = `INSERT INTO MOD_ECM (id, title, description, caseReason, caseNumber, manageJudge,courtClerk , startDate, endDate) VALUES (${id},'${title}','${desc}','${caseReason}','${caseNumber}','${user}','${courtClerk}','${ds}', ${de})`;
    const count = await syb.p_update(sql);
    return count;
};

exports.updateECM = async (id, title, desc, caseReason, caseNumber, user,courtClerk, datestart, dateend) => {
    // chain all your queries here. make sure you return them.
    let us = '';
    if (user) {
        us = `,
        manageJudge = '${user}'`;
    } else {
        const sql = `SELECT XM
FROM PUB_SPRY WHERE AJXH = ${id} AND FG = '0'`;

        user = await syb.p_select(sql);
        us = `,
        manageJudge = '${user[0].XM}'`;
    }

    let cc = ''
    if(courtClerk)
    {
        cc = `,
        courtClerk = '${courtClerk}'`
    }
    let ds = '';
    if (datestart) {
        const sql = `SELECT LARQ
FROM PUB_AJ_JB WHERE AJXH ='${id}'`;
        const d_s = await syb.p_select(sql);
        ds = `,
        startDate = '${d_s[0].LARQ}'`;
    }
    let de = '';
    if (dateend) {
        de = `,
        endDate = '${dateend}'`;
    }

    const sql = `
    UPDATE MOD_ECM
    SET title = '${title}',
        description = '${desc}',
        caseReason = '${caseReason}',
        caseNumber = '${caseNumber}'${us} ${cc} ${ds} ${de}
    WHERE id= ${id}`;
    const count = await syb.p_update(sql);
    return count;
};

exports.deleteECM = async (id) => {
    // chain all your queries here. make sure you return them.
    const sql = `DELETE FROM MOD_ECM WHERE id=${id}`;
    const count = await syb.p_update(sql);
    return count;
};

exports.findECMById = async (id) => {
    // chain all your queries here. make sure you return them.
    const sql = `SELECT * FROM MOD_ECM WHERE id= ${id}`;
    const res = await syb.p_select(sql);
    if (res.length != 0) {
        return res[0];
    }
    return null;
};
exports.findECMByIdInRaw = async (id) => {
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


exports.findECMList = async (name) => {
    // chain all your queries here. make sure you return them.
    const sql = `SELECT * FROM MOD_ECM WHERE id in (SELECT AJXH FROM PUB_SPRY WHERE XM = '${name}') `;
    const data = await syb.p_select(sql);
    const dv = [];
    for (const i in data) {
        dv.push({
            id: data[i].id,
            caseId: data[i].caseNumber,
            caseTitle: data[i].title,
            manageJudge: data[i].manageJudge,
            courtClerk: data[i].courtClerk,
            caseDate: data[i].startDate,
        });
    }

    return dv;
};


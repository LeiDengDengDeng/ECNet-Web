/* eslint-disable guard-for-in */
const sydb = require('./connect');

async function check(user, psw) {
    const sql = `SELECT YHMC,YHSF FROM PUB_XTGL_YHB WHERE YHDM= \'${user}\' AND YHKL=\'${psw}\'`;
    const res = await sydb.p_select(sql);

    if (res.length == 0) {
        return {
            cert: false,
        };
    }

    return {
        cert: true,
        name: res[0].YHMC,
        rank: res[0].YHSF,
    };
}
exports.caseListAll = async function (name) {
    const sql_all = `SELECT PUB_SPRY.AJXH,PUB_AJ_JB.AH,PUB_AJ_JB.AJMC,PUB_AJ_JB.AJXZ,PUB_AJ_JB.LARQ,PUB_AJ_JB.JARQ,PUB_SPRY.FG,PUB_SPRY.SFCBR,PUB_SPRY.XM FROM PUB_AJ_JB INNER JOIN PUB_SPRY ON PUB_AJ_JB.AJXH=PUB_SPRY.AJXH WHERE PUB_AJ_JB.AJXH IN (
SELECT AJXH FROM PUB_SPRY WHERE XM like '%${name}%' )AND  (SFCBR= 'Y' OR FG='0')`;
    const res = await sydb.p_select(sql_all);
    const ret = {};
    for (const item in res) {
        const id = res[item].AJXH;
        const acase = {
            id: res[item].AJXH,
            caseId: res[item].AH,
            caseTitle: res[item].AJMC,
            type: res[item].AJXZ,
            caseDate: res[item].LARQ,
        };
        if (!ret[id]) {
            ret[id] = acase;
        }
        if (res[item].FG == '0') {
            ret[id].courtClerk = res[item].XM;
        } else if (res[item].SFCBR == 'Y') {
            ret[id].manageJudge = res[item].XM;
        }else {
            console.log('ERR: MISSING MESSAGE ABOUT TABLE SPRY,error may occured in reading data from database')
        }
    }
    let ret_arr  = []
    for (let value in ret)
    {
        ret_arr.push(ret[value])
    }
    return ret_arr;
};
exports.caseList = async function (name, finished, mainJudge, caseNum, datestart, dateend) {
    //const sql_not_process = `SELECT PUB_SPRY.AJXH,PUB_AJ_JB.AH,PUB_AJ_JB.AJMC,PUB_AJ_JB.AJXZ,PUB_AJ_JB.LARQ,PUB_AJ_JB.JARQ,PUB_SPRY.FG,PUB_SPRY.SFCBR,PUB_SPRY.XM FROM PUB_AJ_JB INNER JOIN PUB_SPRY ON PUB_AJ_JB.AJXH=PUB_SPRY.AJXH WHERE PUB_AJ_JB.AJXH IN ( SELECT AJXH FROM PUB_SPRY WHERE XM='${name}' )AND  (SFCBR= 'Y' OR FG='0') AND PUB_AJ_JB.AJXH NOT IN (SELECT id FROM MOD_ECM WHERE endDate=NULL )`;
    const sql_not_process = `SELECT PUB_SPRY.AJXH,PUB_AJ_JB.AH,PUB_AJ_JB.AJMC,PUB_AJ_JB.AJXZ,PUB_AJ_JB.LARQ,PUB_AJ_JB.JARQ,PUB_SPRY.FG,PUB_SPRY.SFCBR,PUB_SPRY.XM FROM PUB_AJ_JB INNER JOIN PUB_SPRY ON PUB_AJ_JB.AJXH=PUB_SPRY.AJXH WHERE PUB_AJ_JB.AJXH IN ( SELECT AJXH FROM PUB_SPRY WHERE XM like '%${name}%' )AND  (SFCBR= 'Y' OR FG='0') AND PUB_AJ_JB.AJXH NOT IN (SELECT id FROM MOD_ECM WHERE endDate=NULL )`;

    const res = await sydb.p_select(sql_not_process);
    const ret = {};
    for (const item in res) {
        if (finished == null) {

        } else if (finished) {
            if (!res[item].JARQ) { continue; }
        } else if (res[item].JARQ) { continue; }
        if (datestart) {
            if (datestart > res[item].LARQ) { continue; }
        }
        if (dateend) {
            if (dateend > res[item].LARQ) { continue; }
        }
        const id = res[item].AJXH;
        const acase = {
            id: res[item].AJXH,
            caseId: res[item].AH,
            caseTitle: res[item].AJMC,
            type: res[item].AJXZ,
            caseDate: res[item].LARQ,
        };
        if (!ret[id]) {
            ret[id] = acase;
        }
        if (res[item].FG == '0') {
            ret[id].courtClerk = res[item].XM;
        } else if (res[item].SFCBR == 'Y') {
            ret[id].manageJudge = res[item].XM;
        }else {
            console.log('ERR: MISSING MESSAGE ABOUT TABLE SPRY,error may occured in reading data from database')
        }
    }
    let ret_arr  = []
    for (let value in ret)
    {
        ret_arr.push(ret[value])
    }
    return ret_arr;
};

exports.checkLogin = check;

// index: modified by chugare in 2017-8-11
const userDao = require('../sybaseDao/userDao');
const ecmDao = require('../sybaseDao/ecmDao');
const sydb = require('../sybaseDao/connect');
const headerDao = require('../sybaseDao/headerDao');
const bodyDao = require('../sybaseDao/bodyDao');
const jointDao = require('../sybaseDao/jointDao');
const arrowDao = require('../sybaseDao/arrowDao');

const query_set = sydb.p_query_s;
const fs = require('fs');

const createECM = async (ctx, next) => {
    const model = ctx.request.body.ECMModel;
    console.log(`ECMModel start: ${JSON.stringify(model)}`);

    const id = model.id;
    if (id) {
        const ecm = await ecmDao.findECMById(Number(id));
        if (ecm) {
            ctx.throw(400, 'id already exists,please use update method');
        }
    }

    const caseNumber = model.caseNumber;
    if (!caseNumber) {
        ctx.throw(400, 'miss caseNumber');
    }
    // else{
    //     let ecm = await ecmDao.findECMByCaseNumber(caseNumber);
    //     if(!!ecm){
    //         ctx.throw(400, '已经存在的案号,新增失败');
    //     }
    // }

    // trans函数结果使用await获得
    const count = await ecmDao.createECM(id, model.title, model.description, model.caseReason, model.caseNumber, ctx.session.name);
    console.log(`CREATE ${count} ecm UPDATED or INSERTED`);
    const qs = new sydb.p_query_s();
    bodyDao.updateBody_s(model.ebody, id, qs);
    headerDao.updateHeader_s(model.eheader, id, qs);
    arrowDao.updateArrow_s(model.hrelation, id, qs);
    jointDao.updateJoint_s(model.connector, id, qs);
    const res = await qs.execute();
    ctx.response.body = res;
};
const getECM = async (ctx, next) => {
    const name = ctx.session.name;
    const ecmId = ctx.request.url.split('?')[1];
    let res = await ecmDao.findECMById(ecmId);
    if (res) {
        const title = res.title;
        const caseNumber = res.caseNumber;
        ctx.render('index.html', { user: name, casetitle: title, caseId: ecmId });
    } else {
        res = await ecmDao.findECMByIdInRaw(ecmId);
        if (!res) {
            ctx.throw(400, '案件序号不存在');
            return;
        }
        if (name != res.manageJudge && name != res.courtClerk) {
            ctx.response.body = `<script> alert('该案件的负责法官还未创建该案件的证据链模型图，您还无法查看该图')
window.location.href='/manage'</script>`;

            return;
        }
        const title = res.title;
        const caseNumber = res.caseNumber;
        ecmDao.createECM(ecmId, title, '', '', caseNumber,res.manageJudge,res.courtClerk);
        ctx.render('index.html', { user: name, casetitle: title, caseId: ecmId });
    }
};

const updateECM = async (ctx, next) => {
    const model = ctx.request.body.ECMModel;
    const operator = ctx.session.name;
    if (!model) {
        ctx.throw(400, 'miss parameter ECMModel');
    }
    const id = ctx.request.body.id || model.id;
    if (!id) {
        ctx.throw(400, 'miss parameter id');
    }

    const caseNumber = model.caseNumber;
    if (!caseNumber) {
        ctx.throw(400, 'caseNumber can\'t be empty');
    }
    if (model.manageJudge != operator && model.courtClerk != operator) {
        ctx.response.body = `<script> alert('由于您不是该案件的承办人或书记员，所以您无法修改该案件的相关文件，但您仍然可以将修改的文件保存在本地，作为建议的材料')
window.location.href='/manage'</script>`;
        return;
    }

    const count = await ecmDao.updateECM(id, model.title, model.description, model.caseReason, model.caseNumber, null, null, null);
    console.log(`CREATE ${count} ecm UPDATED or INSERTED`);

    const qs = new query_set();
    bodyDao.updateBody_s(model.ebody, id, qs);
    headerDao.updateHeader_s(model.eheader, id, qs);
    arrowDao.updateArrow_s(model.hrelation, id, qs);
    jointDao.updateJoint_s(model.connector, id, qs);
    const res = await qs.execute();
    // console.log(`CREATE ECMModel SUCCESS: ${JSON.stringify(re)}`);
    ctx.response.body = res;
};

const deleteECM = async (ctx, next) => {
    // let name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';

    const id = ctx.request.body.id;
    if (!id) {
        ctx.throw(400, 'miss parameter id');
    }

    // trans函数结果使用await获得
    await trans(async () => {
        await ecmDao.deleteECM(id);
        await headerDao.deleteByECMId(id);
        await bodyDao.deleteByECMId(id);
        await jointDao.deleteByECMId(id);
        await arrowDao.deleteByECMId(id);
    });


    ctx.response.body = '删除成功';
};

const findECMDetail = async (ctx, next) => {
    // let name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';
    if (!ctx.params.ecmID) {
        ctx.throw(400, 'miss ecmID');
    }

    const ecmID = ctx.params.ecmID;
    const ecm = await ecmDao.findECMById(ecmID);

    let maxID = 0;
    const modify = function (arr) {
        if (arr) {
            arr.forEach((t) => {
                t.$ = { id: t.relativeID || -1 };
                maxID = Math.max(maxID, t.$.id);
            });
        }
        return arr;
    };


    if (!!ecm && !!ecm.id) {
        const headers = await headerDao.findByECMId(ecmID);
        ecm.eheader = modify(headers) || [];
        const bodies = await bodyDao.findByECMId(ecmID);
        ecm.ebody = modify(bodies) || [];
        const joints = await jointDao.findByECMId(ecmID);
        ecm.connector = modify(joints) || [];
        const arrows = await arrowDao.findByECMId(ecmID);
        ecm.hrelation = modify(arrows) || [];

        ecm.maxID = maxID;
    }


    ctx.response.body = ecm || {};
    ctx.response.type = 'application/json';
};


const fn_combineWord = async (ctx, next) => {
    const model = ctx.request.body.ECMModel;
    let evidence = '';
    if (model.ebody) {
        evidence = '本庭采集了以下证据:\n';
        for (let i = 0; i < model.ebody.length; i++) {
            let content = '';
            if (model.ebody[i].commiter) {
                content += `${model.ebody[i].commiter}提供了`;
            }
            content += `${model.ebody[i].evidenceType}:${model.ebody[i].content}。`;
            evidence = `${evidence + (i + 1)}. ${content
                 }本庭${model.ebody[i].evidenceReason},${model.ebody[i].evidenceConclusion
                 }${i == model.ebody.length - 1 ? '。' : ';'}\n`;
        }
    }
    let fact = '';
    if (model.connector) {
        fact = '经审理查明:\n';
        for (let i = 0; i < model.connector.length; i++) {
            fact = `${fact + (i + 1)}. ${model.connector[i].content
                 }${i == model.connector.length - 1 ? '。' : ';'}\n`;
        }
    }
    const data = evidence + fact;
    fs.writeFile(`${process.cwd()}/dist/word.txt`, data, (err) => {
        if (err) {
            console.log(err);
        }
    });
    ctx.response.type = 'text/plain';
    ctx.response.body = '/dist/word.txt';
};

module.exports = {
    'GET /index.html': getECM,
    'POST /saveECM': createECM,
    'POST /updateECM': updateECM,
    'POST /deleteECM/:ecmID': deleteECM,
    'GET /findECMDetail/:ecmID': findECMDetail,
    'POST /combineWord': fn_combineWord,
};

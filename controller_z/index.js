// index:
const ecmDao = require('../dao/ecmDao');
const headerDao = require('../dao/headerDao');
const bodyDao = require('../dao/bodyDao');
const jointDao = require('../dao/jointDao');
const arrowDao = require('../dao/arrowDao');
const trans = require("../models/dbutil");
const header = require('../models/header');

const fs = require('fs');

let createECM = async(ctx, next) => {

    let model = ctx.request.body.ECMModel;
    console.log(`ECMModel start: ${JSON.stringify(model)}`);

    let id = model.id;
    if(!!id){
        let ecm = await ecmDao.findECMById(Number(id));
        if(!!ecm){
            ctx.throw(400, 'id already exists,please use update method');
        }
    }

    let caseNumber = model.caseNumber;
    if(!caseNumber){
        ctx.throw(400, 'miss caseNumber');
    }
    // else{
    //     let ecm = await ecmDao.findECMByCaseNumber(caseNumber);
    //     if(!!ecm){
    //         ctx.throw(400, '已经存在的案号,新增失败');
    //     }
    // }

    // trans函数结果使用await获得
    let re = await trans(async() => {
        let ecm = await ecmDao.createECM(model.title, model.description,model.caseReason,model.caseNumber);
        // 存链头链体连接点箭头

        let modify = function (arr) {
            arr.forEach(t => {
                t.ecmID = ecm.id;
                t.relativeID = t.$.id || -1;
            });
            return arr;
        };

        let headers = modify(model.eheader || []);
        await headerDao.createBulkHeader(headers);

        let bodies = modify(model.ebody || []);
        await bodyDao.createBulkBody(bodies);

        let joints = modify(model.connector || []);
        await jointDao.createBulkJoint(joints);

        let arrows = modify(model.hrelation || []);
        await arrowDao.createBulkArrow(arrows);
        // chain all your queries here. make sure you return them.
        return ecm;
    });


    ctx.response.body = `success`;

};
let getECM = async(ctx,next)=>{
    const name = ctx.session.name;
    const caseId = ctx.params.ecmID

}

let updateECM = async(ctx, next) => {

    let model = ctx.request.body.ECMModel;

    if (!model) {
        ctx.throw(400, 'miss parameter ECMModel');
    }
    let id = ctx.request.body.id || model.id;
    if (!id) {
        ctx.throw(400, 'miss parameter id');
    }

    let caseNumber = model.caseNumber;
    if (!caseNumber) {
        ctx.throw(400, 'caseNumber can\'t be empty');
    }

    let ecm = await ecmDao.findECMById(Number(id));
    if (!ecm || !ecm['id']) {
        ctx.throw(400, 'id error,ecm not exists');
    }

    // trans函数结果使用await获得
    let re = await trans(async() => {

        let now = await ecmDao.updateECM(ecm, model.title, model.description,model.caseReason,model.caseNumber);
        // 存链头链体连接点箭头

        let modify = function (arr) {
            arr.forEach(t => {
                t.ecmID = id;
                t.relativeID = !!t.$ ? t.$.id : -1;
            });
            return arr;
        };

        let headers = modify(model.eheader || []);
        await headerDao.coverBulkHeader(id, headers);

        let bodies = modify(model.ebody || []);
        await bodyDao.coverBulkBody(id, bodies);

        let joints = modify(model.connector || []);
        await jointDao.coverBulkJoint(id, joints);

        let arrows = modify(model.hrelation || []);
        await arrowDao.coverBulkArrow(id, arrows);
        // chain all your queries here. make sure you return them.
        return now;
    });

    // console.log(`CREATE ECMModel SUCCESS: ${JSON.stringify(re)}`);

    ctx.response.body = `success`;

};

let deleteECM = async(ctx, next) => {
    // let name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';

    let id = ctx.request.body.id;
    if (!id) {
        ctx.throw(400, 'miss parameter id');
    }

    // trans函数结果使用await获得
    await trans(async() => {
        await ecmDao.deleteECM(id);
        await headerDao.deleteByECMId(id);
        await bodyDao.deleteByECMId(id);
        await jointDao.deleteByECMId(id);
        await arrowDao.deleteByECMId(id);

    });


    ctx.response.body = `删除成功`;

};

let findECMDetail = async(ctx, next) => {
    // let name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';
    if (!ctx.params.ecmID) {
        ctx.throw(400, 'miss ecmID');
    }

    let ecmID = ctx.params.ecmID;
    let ecm = await ecmDao.findECMById(ecmID);

    let maxID = 0;
    let modify = function (arr) {
        arr.forEach(t => {
            t.dataValues.$ = {id: t.relativeID||-1};
            maxID = Math.max(maxID,t.dataValues.$.id);
        });
        return arr;
    };


    if(!!ecm&&!!ecm.id){

        let headers = await headerDao.findByECMId(ecmID);
        ecm.dataValues.eheader = modify(headers) || [];
        let bodies = await bodyDao.findByECMId(ecmID);
        ecm.dataValues.ebody = modify(bodies) || [];
        let joints = await jointDao.findByECMId(ecmID);
        ecm.dataValues.connector = modify(joints) || [];
        let arrows = await arrowDao.findByECMId(ecmID);
        ecm.dataValues.hrelation = modify(arrows) || [];

        ecm.dataValues.maxID = maxID;
    }


    ctx.response.body = ecm||{};
    ctx.response.type = 'application/json';

};

let findECMList = async(ctx, next) => {

    // trans函数结果使用await获得
    let re = await trans(async() => {
        // chain all your queries here. make sure you return them.
        return ecmDao.findECMList();
    });

    ctx.response.body = `${JSON.stringify(re)}`;


};

let test = async(ctx, next) => {

    // let id = ctx.request.body.id;
    // if (!id) {
    //     ctx.throw(400, 'miss parameter id');
    // }

    // trans函数结果使用await获得
    let re = await trans(async() => {
        // chain all your queries here. make sure you return them.
        return ecmDao.findECMList();
    });

    ctx.response.body = re;
    ctx.response.type = 'application/json';

};

let fn_combineWord = async(ctx, next) => {
    let model = ctx.request.body.ECMModel;
    let evidence = ``;
    if (model.ebody) {
        evidence = `本庭采集了以下证据:\n`;
        for (let i = 0; i < model.ebody.length; i++) {
            let content = ``;
            if (model.ebody[i].commiter) {
                content += model.ebody[i].commiter + `提供了`;
            }
            content += model.ebody[i].evidenceType + `:` + model.ebody[i].content + `。`;
            evidence = evidence + (i + 1) + `. ` + content
                + `本庭` + model.ebody[i].evidenceReason + `,` + model.ebody[i].evidenceConclusion
                + (i == model.ebody.length - 1 ? `。` : `;`) + `\n`;
        }
    }
    let fact = ``;
    if (model.connector) {
        fact = `经审理查明:\n`;
        for (let i = 0; i < model.connector.length; i++) {
            fact = fact + (i + 1) + `. ` + model.connector[i].content
                + (i == model.connector.length - 1 ? `。` : `;`) + `\n`;
        }
    }
    let data = evidence + fact;
    fs.writeFile(process.cwd() + '/dist/word.txt', data, function (err) {
        if (err) {
            console.log(err);
        }
    });
    ctx.response.type = 'text/plain';
    ctx.response.body = '/dist/word.txt';
};

module.exports = {
    'GET /index.html': async(ctx, next) => {

        ctx.render('index.html', {});
    },
    'POST /saveECM': createECM,
    'POST /updateECM': updateECM,
    'POST /deleteECM/:ecmID': deleteECM,
    'GET /test': test,
    'GET /findECMDetail/:ecmID': findECMDetail,
    'GET /findECMList': findECMList,
    'POST /combineWord': fn_combineWord
};
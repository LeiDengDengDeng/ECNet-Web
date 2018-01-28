// index:
const logicDao = require('../dao/logicDao');
const logicNodeDao = require('../dao/logicNodeDao');
const trans = require("../models/dbutil");

let createLogic = async(ctx, next) => {
    let model = ctx.request.body;

    let id = model.id;
    if(!!id){
        let logic = await logicDao.findECMById(Number(id));
        if(!!logic){
            ctx.throw(400, '已经存在的id,请调用update接口');
        }
    }

    // trans函数结果使用await获得
    let res = await trans(async() => {
        let logic = await logicDao.createLogic(model.title,model.caseReason,model.caseNumber);
        id=logic.dataValues.id;
        let filter = function (arr) {
            arr.forEach(n => {
                n.logicID = id;
                n.relativeID = n.id || -1;
                if(!n.leadTo){
                    n.leadTo = 0;
                }
                delete n["id"];
            });
            return arr;
        };
        let nodes = filter(model.data);
        await logicNodeDao.bulkCreateNode(nodes);
    });

    ctx.response.type='text/plain';
    ctx.response.body = `success`;

};

module.exports = {
    'GET /logic.html': async (ctx, next) => {
        ctx.render('logic.html', {});
    },
    'POST /saveLogic': createLogic
};
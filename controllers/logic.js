// index:
const logicDao = require('../sybaseDao/logicDao');
const logicNodeDao = require('../sybaseDao/logicNodeDao');
const sydb = require('../sybaseDao/connect');
const getLogic = async(ctx,next)=>{

    const name = ctx.session.name;
    const logicId = ctx.request.url.split('?')[1];
    let res = await logicDao.findLOGICById(logicId);
    if (res) {
        const title = res.title;
        const caseNumber = res.caseNumber;
        ctx.render('logic.html', { user: name, casetitle: title, caseId:logicId});
    } else {
        res = await logicDao.findLOGICByIdInRaw(logicId);
        if (!res) {
            ctx.throw(400, '案件序号不存在');
            return;
        }
        if(name!=res.manageJudge&&name!=res.courtClerk){
            ctx.response.body = `<script> alert('该案件的负责法官还未创建该案件的说理逻辑图，您还无法查看该图')
window.location.href='/manage'</script>`;
            return
        }
        const title = res.title;
        const caseNumber = res.caseNumber;
        logicDao.createLOGIC(logicId, title, '', '', caseNumber,res.manageJudge,res.courtClerk);
        ctx.render('logic.html', { user: name, casetitle: title, caseId:logicId });
    }
}
const createLogic = async (ctx, next) => {
    const model = ctx.request.body;
    const id = model.id;

    const qs = new sydb.p_query_s();
    const filter = function (arr) {
        arr.forEach((n) => {
            n.logicID = id;
            n.relativeID = n.id || -1;
            if (!n.leadTo) {
                n.leadTo = 0;
            }
            delete n.id;
        });
        return arr;
    };
    const nodes = filter(model.data);

    let res = await logicDao.createLOGIC(id, model.title, model.description, model.caseReason, model.caseNumber, ctx.session.name);
    logicNodeDao.updateNode_s(nodes, id, qs);
    res = await qs.execute();
    console.log('Logic update result: ');
    console.log(res);
    ctx.response.type = 'text/plain';
    ctx.response.body = 'success';
};
const updateLogic = async (ctx, next) => {
    const model = ctx.request.body;
    const id = model.id;
    const operator = ctx.session.name
    const qs = new sydb.p_query_s();
    const filter = function (arr) {
        arr.forEach((n) => {
            n.logicID = id;
            n.relativeID = n.id || -1;
            if (!n.leadTo) {
                n.leadTo = 0;
            }
            delete n.id;
        });
        return arr;
    };

    if(model.manageJudge!=operator&&model.courtClerk!=operator){
        ctx.response.body = `<script> alert('由于您不是该案件的承办人或书记员，所以您无法修改该案件的相关文件，但您仍然可以将修改的文件保存在本地，作为建议的材料')
window.location.href='/manage'</script>`;
        return
    }
    const nodes = filter(model.data);

    let res = await logicDao.updateLOGIC(id, model.title, model.description, model.caseReason, model.caseNumber, model.manageJudge,model.courtClerk);
    logicNodeDao.updateNode_s(nodes, id, qs);
    res = await qs.execute();
    console.log('Logic update result: ');
    console.log(res);
    ctx.response.type = 'text/plain';
    ctx.response.body = 'success';
};
const deleteLogic = async (ctx, next) => {

};
const findLogicDetail = async (ctx, next) => {
    const id = ctx.params.logicId;
    const nodes = await logicNodeDao.getNodesList(id);
    for (const i in nodes) {
        if(nodes[i].leadTo==0)
            nodes[i].leadTo=null
        nodes[i].id = nodes[i].relativeID;
    }
    const logic = await logicDao.findLOGICById(id);
    if(!logic){
        ctx.response.body = 'Logic not exist'
        return
    }
    const data = {
        id,
        title: logic.title,
        description: logic.description,
        caseReason: logic.caseReason,
        caseNumber: logic.caseNumber,
        manageJudge: logic.manageJudge,
        startDate: logic.startDate,
        data: nodes,
    };
    ctx.response.body = data;
};
module.exports = {
    'GET /logic.html':getLogic,
    'POST /saveLogic': updateLogic,
    'POST /updateLogic': updateLogic,
    'GET /findLogicDetail/:logicId': findLogicDetail,
};

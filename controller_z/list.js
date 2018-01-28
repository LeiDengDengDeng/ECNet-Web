//list
const ecmDao = require('../dao/ecmDao');
const logicDao = require('../dao/logicDao');
const trans = require("../models/dbutil");
let ECMList = async(ctx, next) => {
    // trans函数结果使用await获得
    let evidence = await trans(async() => {
        // chain all your queries here. make sure you return them.
        return ecmDao.findECMList();
    });

    let logic = await trans(async() => {
        // chain all your queries here. make sure you return them.
        return logicDao.findLogicList();
    });
    logic.forEach((item) => {
        let date = item.updatedAt.getFullYear() + '-' + item.updatedAt.getMonth() + '-' + item.updatedAt.getDate();
        item.updatedDate=date;
    });
    ctx.render('list.html', {evidence: evidence, logic: logic});
}
module.exports = {
    'GET /': ECMList,
    'GET /list.html': ECMList
}
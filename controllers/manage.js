/**
 * Created by simengzhao on 2017/7/27.
 */
const userDao = require('../sybaseDao/userDao');
const ecmDao = require('../sybaseDao/ecmDao')
async function managePage(ctx, next) {
    ctx.render('manage.html', { user: ctx.session.name });
}
async function getCases(ctx, next) {
    const ret = [];
    var data;
    switch (ctx.params.type) {
        case 'all':
            data = await userDao.caseListAll(ctx.session.name)
        case 'finished':
            data = await userDao.caseList(ctx.session.name, true);
            ctx.response.body = data;
            break;
        case 'processing':
            data = await ecmDao.findECMList(ctx.session.name);
            ctx.response.body = data;
            break;
        case 'raw':
            data = await userDao.caseList(ctx.session.name, false);

            ctx.response.body = data;

            break;
    }
}
module.exports = {
    'GET /':managePage,
    'GET /manage': managePage,
    'POST /case/:type': getCases,
};

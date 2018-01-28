// index:

module.exports = {
    'GET /new.html': async (ctx, next) => {
        ctx.render('new.html', {});
    }
};
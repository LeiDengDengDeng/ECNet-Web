

exports.loginCheck = function (ctx) {
    if (ctx.session.logged) {
        const info = {
            name: ctx.session.name,
        };
        return info;
    }
    return null;
};

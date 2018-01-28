/**
 * Created by simengzhao on 2017/7/27.
 */
const sessTools = require('../session')
const user = require('../sybaseDao/userDao')
const crypto = require('crypto')
const requestLogin = async(ctx,next)=>{
    let info = sessTools.loginCheck(ctx)
    if (info){
        console.log(info)
        //当存在登陆信息的时候，直接进入管理界面
        ctx.response.redirect('/manage')

    }else
    {
        //不存在登陆信息的时候要进行登陆
        ctx.render('login.html');

    }
}
const checkLogin = async(ctx,next)=>{

    let res = await user.checkLogin(ctx.request.body.username,ctx.request.body.userpwd)

    if (res.cert){
        ctx.session.logged = true
        console.log(res.name)
        ctx.session.name = res.name
        ctx.session.rank = res.rank
        ctx.response.redirect('/manage')

    }else{
        ctx.response.body = 'fail'
        ctx.response.redirect('/login')
    }

}
const checkredirectLogin = async(ctx,next)=>{

    let res = await user.checkLogin(ctx.request.body.username,ctx.request.body.userpwd)

    if (res.cert){
        ctx.session.logged = true
        console.log(res.name)
        ctx.session.name = res.name
        ctx.response.body = ctx.session.sessionId


    }else{
        ctx.response.body = 'fail'
    }

}
const logout = async(ctx,next)=>{
    ctx.session.logged = false
    ctx.response.redirect('/login')

}
module.exports={
    'GET /login':requestLogin,
    'POST /login':checkLogin,
    'POST /redirectLogin':checkredirectLogin,
    'GET /logout':logout
}
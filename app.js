const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const session = require('koa-generic-session');

const redisStore = require('koa-redis');

const app = new Koa();

const isProduction = process.env.NODE_ENV === 'production';

app.keys = ['keys', 'keykeys'];
app.use(session({
    store: redisStore(),
}));

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);

    let
        start = new Date().getTime(),
        execTime;

    if (ctx.session.logged || ctx.request.url == '/login' || ctx.request.url.startsWith('/public') || ctx.request.url.startsWith('/redirectLog')) {
        await next();
    } else {
        ctx.response.redirect('/login');
    }
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
    ctx.response.set('Access-Control-Allow-Origin',ctx.request.header.origin);
    ctx.response.set('Access-Control-Allow-Credentials', 'true');
});

// static file support:
if (!isProduction) {
    const staticFiles = require('./static-files');
    app.use(staticFiles('/dist/', `${__dirname}/dist`));
    app.use(staticFiles('/public/', `${__dirname}/public`));
}

// parse request body:
app.use(bodyParser());

// add nunjucks as view:
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction,
}));

// add controller:
app.use(controller());

app.listen(8081);
console.log('app started at port 8081...');


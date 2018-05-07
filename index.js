
const os = require('os');
const koaBody = require('koa-body');
const Koa = require('koa');
let router = require('koa-router')();

let robot = require('robotjs');
const FN_LIST = Object.keys(robot).filter(function(fn){ return (typeof robot[fn] === 'function') })

router.get('/health', handleHealth);
router.post('/task', handlePost);

const app = new Koa();
app.proxy = true;
app.use(mwLog);
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
console.log('listening on port 3000');


async function mwLog(ctx, next){
    const start = Date.now();
    await next();
    const end = new Date();
    const ms = end.getTime() - start;
    const time = end.toISOString();
    console.log(`${time} ${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms} - ${ctx.ip} ${ctx.host}`);
}

async function handleHealth(ctx) {
    ctx.response.status = 200;
    let o = new Date().toISOString() + ' ' + os.hostname() + '\n';
    ctx.body = o;
}

async function handlePost(ctx) {


    let param = ctx.request.body;
    console.log(param);

    // cmd param is a must!
    if (!param.cmd){
        ctx.response.status = 400;
        return;
    }
    let actions = []
    try{
        actions = JSON.parse(param.cmd); 
        for (let i=0; i < actions.length; i++){
            let a = actions[i];

            if (!a['fn'] || !a['args']) {
                throw new Error("ACTION_PARAM_NOT_FOUND: fn, args: " + JSON.stringify(a));
            }

            if (!FN_LIST.includes(a['fn'])) {
                throw new Error("ACTION_FUNCTION_NOT_SUPPORTED: " + JSON.stringify(a));
            }

            if (!Array.isArray(a['args'])){
                throw new Error("ACTION_ARGS_IS_NOT_ARRAY: " + JSON.stringify(a));
            }
        }
    }catch(err){
        ctx.response.status = 400; 
    }

    // some action failed
    for (let i=0; i < actions.length; i++){
        let a = actions[i];
        let fn = robot[a['fn']];
        let args = a['args'];
        try{
            a.result = fn(...args);
        }catch(err){
            a.error = err.stack;
            ctx.body = JSON.stringify(actions);
            ctx.response.status = 500;
            return;
        }
    }

    // all action success
    ctx.body = JSON.stringify(actions);
    ctx.response.status = 200;
    return;

}


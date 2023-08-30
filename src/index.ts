import Koa from 'koa';
import KoaRouter from 'koa-router';
import dotenv from 'dotenv';

const app = new Koa();

const router = new KoaRouter();
router.get('/home', (context, next) => {
  context.body = 'home';
  next();
});

router.get('/user', (context) => {
  context.body = 'user';
  console.log(context);
});

app.use(router.routes());

// app.use()

console.log(dotenv.config());

app.listen(3000);

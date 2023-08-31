import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from '@koa/bodyparser';
import dotenv from 'dotenv';

import { userController } from './controller';

// import './db';

const app = new Koa();

const router = new KoaRouter();
router.get('/home', (context, next) => {
  context.body = 'home';
  next();
});

// test only
router.get('/test/:id', userController.getUser);

// create
router.post('/users', userController.createUser);

// read
router.get('/users/:id', userController.getUser);

// update
router.put('/users', userController.updateUser);

// delete
router.delete('/users', userController.deleteUser);

app.use(bodyParser());

// log only
app.use(async (ctx, next) => {
  console.log('api info', ctx.request.toJSON());
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = dotenv.config().parsed?.['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});

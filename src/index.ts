import Koa from 'koa';
import KoaRouter from 'koa-router';
import dotenv from 'dotenv';

import { UserController } from './controller';
import { View } from './views';

import './db';

const app = new Koa();

const router = new KoaRouter();
router.get('/home', (context, next) => {
  context.body = 'home';
  next();
});

// test only
router.get('/test/:id', UserController.getUser);

// create
router.post('/users', console.log);

// read
router.get('/users/:id', (context, next) => {
  context.body = 'user';
  console.log(context);
  next();
});

// update
router.put('/users/:id', console.log);

// delete
router.delete('/users/:id', console.log);

app.use(router.routes()).use(router.allowedMethods());

app.use(View.render);

app.listen(dotenv.config().parsed?.['PORT'] || 3000, () => {
  console.log('server start');
});

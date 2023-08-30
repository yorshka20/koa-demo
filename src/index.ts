import Koa from 'koa';
import KoaRouter from 'koa-router';
import dotenv from 'dotenv';

import { userController } from './controller';
import { View } from './views';

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

const PORT = dotenv.config().parsed?.['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});

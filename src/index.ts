import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from '@koa/bodyparser';
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
router.get('/users/:id', userController.getUser);

// update
router.put('/users/:id', userController.updateUser);

// delete
router.delete('/users/:id', userController.deleteUser);

// for rendering operating page.
router.get('/operate', View.render);

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

const PORT = dotenv.config().parsed?.['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});

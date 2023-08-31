import bodyParser from '@koa/bodyparser';
import Koa from 'koa';
import jwt from 'koa-jwt';
import KoaRouter from 'koa-router';

import { JWT_SECRET, PORT } from './constants';
import {
  loginController,
  unauthorizeRequest,
  userController,
} from './controller';

const app = new Koa();

const router = new KoaRouter();
router.get('/home', (context, next) => {
  context.body = 'home';
  next();
});

// get jwt
router.post('/login', loginController);

// create
router.post('/users', userController.createUser);

// read
router.get('/users/:id', userController.getUser);

// update
router.put('/users', userController.updateUser);

// delete
router.delete('/users', userController.deleteUser);

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(unauthorizeRequest);

app.use(
  jwt({
    secret: JWT_SECRET,
    cookie: 'token', // get token from cookie
    debug: true,
  }).unless({ path: ['/login'] }),
);

app.use(bodyParser());

// log only
app.use(async (ctx, next) => {
  console.log('api info', ctx.request.toJSON());
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});

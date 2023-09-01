import bodyParser from '@koa/bodyparser';
import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import KoaRouter from 'koa-router';

import { PORT } from './constants';
import {
  errorHandler,
  jwtHandler,
  loginController,
  unauthorizeRequest,
  userController,
} from './controller';

const app = new Koa();
const router = new KoaRouter();

// ===> router
// get jwt
router.post('/login', loginController);

// create
router.post('/users', userController.createUser);

// read
router.get('/users/:id', userController.getUser);

// read many
router.get('/users', userController.getUserMany);

// update
router.put('/users/:id', userController.updateUser);

// delete
router.delete('/users/:id', userController.deleteUser);

// ===> middleware
// logger
app.use(logger());
// handle error
app.use(errorHandler);
// parse the post request body
app.use(bodyParser());
// unauthorized request handler
app.use(unauthorizeRequest);
// jwt authorization
app.use(jwtHandler);
// make json response
app.use(json());

// router config
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});

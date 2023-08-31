import jwt from 'jsonwebtoken';
import koaRouter from 'koa-router';
import type { UserInfo } from './types';

import { JWT_SECRET } from './constants';
import { DBController } from './db';

class UserController {
  private dbController: DBController;

  constructor() {
    this.dbController = new DBController();
  }

  private db(): DBController {
    if (this.dbController) {
      return this.dbController;
    }

    this.dbController = new DBController();
    return this.dbController;
  }

  getUser = async (context: koaRouter.RouterContext, next: any) => {
    const { id } = context.params;

    console.log('userId', id);

    const user = await this.db().getUser(context, {
      id,
    });

    console.log('db user', user);

    // response.body = `user: ${id}, query: ${JSON.stringify(query)}`;

    await next();
  };

  createUser = async (context: koaRouter.RouterContext, next: any) => {
    console.log('create ', context.request.body, context.request.toJSON());
    const userInfo: UserInfo = { ...context.request.body };
    const user = await this.db().createUser(context, userInfo);
    console.log('user create', user);

    await next();
  };

  updateUser = async (context: koaRouter.RouterContext, next: any) => {
    const userInfo = { ...context.request.body };
    console.log('updateUser', userInfo);

    await next();
  };

  deleteUser = async (context: koaRouter.RouterContext, next: any) => {
    const { id, name, email }: UserInfo = context.query;
    const result = await this.db().deleteUser(context, { id, name, email });
    console.log('deleteUser', result);

    await next();
  };
}

export const userController = new UserController();

export async function loginController(
  context: koaRouter.RouterContext,
  next: any,
) {
  const { name } = context.request.body;
  const token = jwt.sign(name, JWT_SECRET);

  // set token in cookies
  context.cookies.set('token', token, {
    domain: 'localhost',
    path: '/',
    maxAge: 3 * 60 * 60 * 1000,
    overwrite: true,
  });
  context.response.body = token;

  await next();
}

export async function unauthorizeRequest(
  context: koaRouter.RouterContext,
  next: any,
) {
  return next().catch((err: any) => {
    if (401 == err.status) {
      context.status = 401;
      context.body =
        'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  });
}

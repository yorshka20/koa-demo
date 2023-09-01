import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import koaJwt from 'koa-jwt';

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

    const user = await this.db().getUser({
      id,
    });

    console.log('db user', user);

    context.body = {
      code: 0,
      data: user,
    };

    await next();
  };

  createUser = async (context: koaRouter.RouterContext, next: any) => {
    console.log('create ', context.request.body, context.request.toJSON());
    const userInfo: UserInfo = { ...context.request.body };
    const user = await this.db().createUser(userInfo);
    console.log('user create', user);

    context.body = {
      code: 0,
      data: userInfo,
    };

    await next();
  };

  updateUser = async (context: koaRouter.RouterContext, next: any) => {
    const { id } = context.params;
    const userInfo = { ...context.request.body };
    console.log('updateUser', userInfo);

    const result = await this.db().updateUser(id, userInfo);

    context.body = {
      code: 0,
      data: result,
    };

    await next();
  };

  deleteUser = async (context: koaRouter.RouterContext, next: any) => {
    const { id, name, email }: UserInfo = context.query;
    const result = await this.db().deleteUser({ id, name, email });

    console.log('deleteUser', result);

    context.body = {
      code: 0,
      data: result,
    };

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
  context.body = { token };

  await next();
}

export function unauthorizeRequest(
  context: koaRouter.RouterContext,
  next: any,
) {
  return next().catch((err: any) => {
    if (401 == err.status) {
      context.status = 401;
      context.body = {
        code: 1,
        msg: 'Protected resource, use Authorization header to get access',
      };
    } else {
      throw err;
    }
  });
}

export async function jwtHandler(_: koaRouter.RouterContext, next: any) {
  koaJwt({
    secret: JWT_SECRET,
    cookie: 'token', // get token from cookie
    debug: true,
  }).unless({ path: ['/login'] });

  await next();
}

export function errorHandler(context: koaRouter.RouterContext, next: any) {
  return next().catch((error: any) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      context.body = {
        code: 1,
        msg: error.message,
      };
    } else {
      context.body = {
        code: 1,
        msg: 'unknown error',
      };
    }
  });
}

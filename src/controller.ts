import koaRouter from 'koa-router';
import type { UserInfo } from './types';

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
    const { params, query } = context;
    const { id } = params;

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
    const { id } = context.params;
    const result = await this.db().deleteUser(context, { id });
    console.log('deleteUser', result);

    await next();
  };
}

export const userController = new UserController();

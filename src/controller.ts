import koaRouter from 'koa-router';
import type { UserInfo } from './types';

import { DBController } from './db';
import { userInfo } from 'os';

class UserController implements Controller {
  static dbController: DBController;

  private db(): DBController {
    if (UserController.dbController) {
      return UserController.dbController;
    }

    UserController.dbController = new DBController();
    return UserController.dbController;
  }

  getUser = async (context: koaRouter.RouterContext, next: any) => {
    const { method, message, header, url, params, query, request, response } =
      context;
    const { id } = params;

    console.log('context', context);
    console.log(
      '{ method, message, header, url, params, request, response }',
      {},
    );

    console.log('userId', id, this);

    const user = await this.db().getUser(context, {
      id,
    });

    console.log('db user', UserController.dbController, id, user);

    response.body = `user: ${id}, query: ${JSON.stringify(query)}`;

    await next();
  };

  createUser = async (context: koaRouter.RouterContext, next: any) => {
    console.log('create ', context.request);
    const userInfo: UserInfo = {};
    const user = await this.db().createUser(context, userInfo);
    console.log('user create', user);

    await next();
  };

  updateUser = async (userId: string, userInfo: UserInfo) => {
    console.log('userid', userId, userInfo);
  };
}

abstract class Controller {
  static getUser: koaRouter.IMiddleware;

  static updateUser: koaRouter.IMiddleware;
}

export const userController = new UserController();

import { PrismaClient } from '@prisma/client';
import koaRouter from 'koa-router';
import type { UserInfo } from './types';

export class UserController implements Controller {
  static dbInstance: PrismaClient;

  static db(): PrismaClient {
    if (UserController.dbInstance) {
      return UserController.dbInstance;
    }

    UserController.dbInstance = new PrismaClient();
    return UserController.dbInstance;
  }

  static async getUser(context: koaRouter.RouterContext, next: any) {
    const { method, message, header, url, params, query, request, response } =
      context;
    const { id } = params;

    console.log('context', context);
    console.log(
      '{ method, message, header, url, params, request, response }',
      {},
    );

    console.log('userId', id);

    // const user = await UserController.db().$connect();
    console.log('db instance', UserController.dbInstance);

    response.body = `user: ${id}, query: ${JSON.stringify(query)}`;

    await next();
    return '';
  }

  static updateUser(userId: string, userInfo: UserInfo) {
    console.log('userid', userId, userInfo);
  }
}

abstract class Controller {
  static getUser: koaRouter.IMiddleware;

  static updateUser: koaRouter.IMiddleware;
}

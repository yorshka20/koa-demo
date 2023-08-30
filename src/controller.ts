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

  static getUser(context: koaRouter.RouterContext, next: any) {
    const { method, message, header, url, params, request, response } = context;
    const { userId } = params;

    console.log('context', context);
    console.log('{ method, message, header, url, params, request, response }', {
      method,
      message,
      header,
      url,
      params,
      request,
      response,
    });
    console.log('rest', next);
    console.log('userId', userId);
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

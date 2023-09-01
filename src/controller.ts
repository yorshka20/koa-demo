import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import koaJwt from 'koa-jwt';
import type { RouterContext } from 'koa-router';

import { INVALID_INPUT_ERROR, JWT_SECRET } from './constants';
import { DBController } from './db';
import { ErrorCode, ErrorMsg } from './errors';
import type { RouterNext, UserInfo } from './types';
import { validateCreateUser, validateUpdateUser } from './utils';

/**
 * user controller
 *
 * - combined user operations
 * - handle all user-related requests
 *
 * @class UserController
 */
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

  /**
   * get single user info by userId
   *
   * @param {RouterContext} context
   * @param {RouterNext} next
   * @memberof UserController
   */
  getUser = async (context: RouterContext, next: RouterNext) => {
    const { id } = context.params;

    // input validate
    if (!id) {
      context.body = {
        code: ErrorCode.INVALID_INPUT,
        msg: ErrorMsg.ID_EMPTY,
      };
      throw new Error(INVALID_INPUT_ERROR);
    }

    const user = await this.db().getUser({
      id,
    });

    context.body = {
      code: ErrorCode.NO_ERROR,
      data: user,
    };

    await next();
  };

  /**
   * query multiple users by conditions
   *
   * supported query conditions:
   * - name
   * - email
   *
   * @param {RouterContext} context
   * @param {RouterNext} next
   * @memberof UserController
   */
  getUserMany = async (context: RouterContext, next: RouterNext) => {
    const { name, email } = context.query as { name: string; email: string };

    const users = await this.db().getUserMany({ name, email } as UserInfo);

    context.body = {
      code: ErrorCode.NO_ERROR,
      data: users || [],
    };

    await next();
  };

  /**
   * create a user
   *
   * @param {RouterContext} context
   * @param {RouterNext} next
   * @memberof UserController
   */
  createUser = async (context: RouterContext, next: RouterNext) => {
    const userInfo: UserInfo = { ...context.request.body };

    // input validate
    const { code, msg } = validateCreateUser(userInfo);
    if (code !== ErrorCode.NO_ERROR) {
      context.body = { code, msg };
      throw new Error(INVALID_INPUT_ERROR);
    }

    const user = await this.db().createUser(userInfo);

    context.body = {
      code: ErrorCode.NO_ERROR,
      data: user,
    };

    await next();
  };

  /**
   * update user info
   *
   * - userId is required
   * - name, email and password is optional
   * - userId can not be updated
   *
   * @param {RouterContext} context
   * @param {RouterNext} next
   * @memberof UserController
   */
  updateUser = async (context: RouterContext, next: RouterNext) => {
    const { id } = context.params;
    const userInfo = { ...context.request.body, id };

    // input validate
    const { code, msg } = validateUpdateUser(userInfo);
    if (code !== ErrorCode.NO_ERROR) {
      context.body = { code, msg };
      throw new Error(INVALID_INPUT_ERROR);
    }

    const result = await this.db().updateUser(userInfo);

    context.body = {
      code: ErrorCode.NO_ERROR,
      data: result,
    };

    await next();
  };

  /**
   * delete a user
   *
   *
   * @param {RouterContext} context
   * @param {RouterNext} next
   * @memberof UserController
   */
  deleteUser = async (context: RouterContext, next: RouterNext) => {
    const { id } = context.params;

    if (!id) {
      context.body = {
        code: ErrorCode.INVALID_INPUT,
        msg: ErrorMsg.ID_EMPTY,
      };
      throw new Error(INVALID_INPUT_ERROR);
    }

    const result = await this.db().deleteUser({ id });

    context.body = {
      code: ErrorCode.NO_ERROR,
      data: result,
    };

    await next();
  };
}

export const userController = new UserController();

/**
 * login api controller
 *
 * - create a jwt token for login user.
 *
 * @export
 * @param {RouterContext} context
 * @param {RouterNext} next
 */
export async function loginController(
  context: RouterContext,
  next: RouterNext,
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

  context.body = {
    code: ErrorCode.NO_ERROR,
    data: {
      token,
    },
  };

  await next();
}

/**
 * handle unauthorized request
 *
 * - this middleware will reject requests without jwt token and return 401 status.
 *
 * @export
 * @param {RouterContext} context
 * @param {RouterNext} next
 * @return {*}
 */
export async function unauthorizeRequest(
  context: RouterContext,
  next: RouterNext,
) {
  try {
    return await next();
  } catch (err: any) {
    if (401 == err.status) {
      context.status = 401;
      context.body = {
        code: 1,
        msg: 'Unauthorized Request.',
      };
    } else {
      throw err;
    }
  }
}

/**
 * jwt authorize middleware
 *
 * - this middleware will check the jwt token from request.
 * - `login` request will be not checked
 * - it extract the token from cookie. so you don't need to use a `Authorization` header.
 *
 * @export
 * @param {RouterContext} context
 * @param {RouterNext} next
 * @return {*}
 */
export async function jwtHandler(context: RouterContext, next: RouterNext) {
  return koaJwt({
    secret: JWT_SECRET,
    cookie: 'token', // get token from cookie
    debug: true,
  }).unless({ path: ['/login'] })(context, next);
}

/**
 * error handler
 *
 * - this middleware will handle the error thrown from other middlewares.
 *
 * @export
 * @param {RouterContext} context
 * @param {RouterNext} next
 * @return {*}
 */
export function errorHandler(context: RouterContext, next: RouterNext) {
  return next().catch((error: any) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      context.body = {
        code: ErrorCode.DB_ERROR,
        msg: error.message,
      };
    } else if (error.message === INVALID_INPUT_ERROR) {
      // error msg has been set on validator. do nothing here
    } else {
      console.log('unknown error: ==>', error);
      context.body = {
        code: ErrorCode.UNKNOWN_ERROR,
        msg: 'unknown error',
      };
    }
  });
}

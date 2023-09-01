import { Prisma, PrismaClient } from '@prisma/client';
import type { UserInfo } from './types';

const prismaConfig: Prisma.PrismaClientOptions = {
  log: ['query', 'info', 'warn', 'error'],
};

type PrismaLogType = 'query' | 'info' | 'warn' | 'error';

// extend the globalThis to support developing in dev environment
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient<Prisma.PrismaClientOptions, PrismaLogType>;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaConfig);
} else {
  // in dev environment we should reuse the prismaClient instance to avoid db connections bug.
  prisma = global.prisma || new PrismaClient(prismaConfig);
}

/**
 * read user info in db.
 *
 * - userId is required.
 *
 * @param {Partial<UserInfo>} userInfo
 * @return {*}  {(Promise<UserInfo | null>)}
 */
async function readUser(userInfo: Partial<UserInfo>): Promise<UserInfo | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userInfo.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * query multiple users in db.
 *
 * supported query conditions:
 * - name
 * - email
 *
 * @param {Partial<UserInfo>} userInfo
 * @return {*}  {Promise<UserInfo[]>}
 */
async function readUserMany(userInfo: Partial<UserInfo>): Promise<UserInfo[]> {
  const users = await prisma.user.findMany({
    where: {
      ...userInfo,
    },
  });

  return users;
}

/**
 * create a user in db.
 *
 * - complete userInfo is required except userId. userId is auto-generated.
 *
 * @param {UserInfo} userInfo
 * @return {*}  {Promise<UserInfo>}
 */
async function createUser(userInfo: UserInfo): Promise<UserInfo> {
  const user = await prisma.user.create({
    data: {
      name: userInfo.name!,
      email: userInfo.email!,
      password: userInfo.password!,
    },
  });

  return user;
}

/**
 * update userInfo in db.
 *
 * - userId is required.
 *
 * @param {Partial<UserInfo>} userInfo
 * @return {*}  {Promise<UserInfo>}
 */
async function updateUser(userInfo: Partial<UserInfo>): Promise<UserInfo> {
  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: {
      ...userInfo,
    },
  });

  return result;
}

/**
 * delete a user in db.
 *
 * - userId is required.
 *
 * @param {Partial<UserInfo>} userInfo
 * @return {*}  {Promise<null>}
 */
async function deleteUser(userInfo: Partial<UserInfo>): Promise<null> {
  await prisma.user.delete({
    where: {
      id: userInfo.id,
    },
  });

  return null;
}

/**
 * db controller
 *
 * - handle all db operations
 * - disconnect itself when error occurs.
 * - connection will be made automatically when making operations by prisma.
 *
 * @export
 * @class DBController
 */
export class DBController {
  constructor() {
    // self disconnect
    prisma.$on('error', () => {
      prisma.$disconnect();
    });
  }

  /**
   * execute callback in try catch.
   *
   * db error will be thrown out.
   *
   * @private
   * @param {() => Promise<any>} callback
   * @return {*}  {Promise<any>}
   * @memberof DBController
   */
  private async safeOperation(callback: () => Promise<any>): Promise<any> {
    try {
      return await callback();
    } catch (error) {
      throw error;
    }
  }

  async getUser(userInfo: Partial<UserInfo>) {
    const user = await this.safeOperation(() => {
      return readUser(userInfo);
    });
    return user;
  }

  async getUserMany(userInfo: Partial<UserInfo>) {
    const users = await this.safeOperation(() => {
      return readUserMany(userInfo);
    });

    return users;
  }

  async createUser(userInfo: UserInfo) {
    const user = await this.safeOperation(() => {
      return createUser(userInfo);
    });
    return user;
  }

  async updateUser(userInfo: Partial<UserInfo>) {
    const result = await this.safeOperation(() => {
      return updateUser(userInfo);
    });
    return result;
  }

  async deleteUser(userInfo: Partial<UserInfo>) {
    const result = await this.safeOperation(() => {
      return deleteUser(userInfo);
    });
    return result;
  }
}

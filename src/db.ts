import { Prisma, PrismaClient } from '@prisma/client';
import type { RequestMethod, UserInfo } from './types';

const prismaConfig: Prisma.PrismaClientOptions = {
  log: ['query', 'info', 'warn', 'error'],
};

type PrismaLogType = 'query' | 'info' | 'warn' | 'error';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient<Prisma.PrismaClientOptions, PrismaLogType>;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaConfig);
} else {
  prisma = global.prisma || new PrismaClient(prismaConfig);
}

async function readUser(userInfo: UserInfo) {
  const user = await prisma.user.findUnique({
    where: {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    },
    select: {
      email: true,
      name: true,
      password: true,
    },
  });

  return user;
}

async function createUser(userInfo: UserInfo) {
  const user = await prisma.user.create({
    data: {
      name: userInfo.name!,
      email: userInfo.email!,
      password: userInfo.password!,
    },
  });

  return user;
}

async function updateUser(userId: string, userInfo: UserInfo) {
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: userInfo.name,
      email: userInfo.email,
      password: userInfo.password,
    },
  });

  return result;
}

async function deleteUser(userInfo: UserInfo) {
  const result = await prisma.user.delete({
    where: {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    },
  });

  return result;
}

export class DBController {
  constructor() {
    // self disconnect
    prisma.$on('error', () => {
      prisma.$disconnect();
    });
  }

  private async safeOperation(
    method: RequestMethod,
    info: { userInfo: UserInfo } & { userId?: string },
  ): Promise<UserInfo | undefined | null> {
    const { userInfo } = info;
    try {
      switch (method) {
        case 'post':
          return createUser(userInfo);
        case 'put':
          return updateUser(info.userId!, userInfo);
        case 'delete':
          return deleteUser(userInfo);
        case 'get':
          return readUser(userInfo);
        default:
          return;
      }
    } catch (error) {
      throw error;
    }
  }

  async getUser(userInfo: UserInfo) {
    const user = await this.safeOperation('get', { userInfo });

    console.log('getUser', user);
    return user;
  }

  async createUser(userInfo: UserInfo) {
    const user = await this.safeOperation('post', { userInfo });

    console.log('createUser', user);
    return user;
  }

  async updateUser(userId: string, userInfo: UserInfo) {
    const result = await this.safeOperation('put', { userId, userInfo });
    console.log('update user', result);
    return result;
  }

  async deleteUser(userInfo: UserInfo) {
    const result = await this.safeOperation('delete', { userInfo });
    console.log('delete user', result);
    return result;
  }
}

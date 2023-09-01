import { Prisma, PrismaClient } from '@prisma/client';
import type { PartialUserInfo, RequestMethod, UserInfo } from './types';

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

async function deleteUser(userInfo: Partial<UserInfo>): Promise<null> {
  await prisma.user.delete({
    where: {
      id: userInfo.id,
    },
  });

  return null;
}

export class DBController {
  constructor() {
    // self disconnect
    prisma.$on('error', () => {
      prisma.$disconnect();
    });
  }

  private async safeOperation<T extends PartialUserInfo = UserInfo>(
    method: RequestMethod,
    info: T,
  ): Promise<any> {
    try {
      switch (method) {
        case 'post':
          return createUser(info as UserInfo);
        case 'put':
          return updateUser(info as Partial<UserInfo>);
        case 'delete':
          return deleteUser(info as Partial<UserInfo>);
        case 'get':
          return readUser(info as Partial<UserInfo>);
        default:
          return;
      }
    } catch (error) {
      throw error;
    }
  }

  async getUser(userInfo: Partial<UserInfo>) {
    const user = await this.safeOperation<Partial<UserInfo>>('get', userInfo);
    return user;
  }

  async createUser(userInfo: UserInfo) {
    const user = await this.safeOperation<UserInfo>('post', userInfo);
    return user;
  }

  async updateUser(userInfo: Partial<UserInfo>) {
    const result = await this.safeOperation<Partial<UserInfo>>('put', userInfo);
    return result;
  }

  async deleteUser(userInfo: Partial<UserInfo>) {
    const result = await this.safeOperation<Partial<UserInfo>>(
      'delete',
      userInfo,
    );
    return result;
  }
}

import { Prisma, PrismaClient } from '@prisma/client';
import type { PartialUserInfo, RequestMethod, UserInfo } from './types';
import { userInfo } from 'os';

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

async function readUserMany(userInfo: Partial<UserInfo>): Promise<UserInfo[]> {
  const users = await prisma.user.findMany({
    where: {
      ...userInfo,
    },
  });

  return users;
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

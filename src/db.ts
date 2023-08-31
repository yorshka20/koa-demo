import { PrismaClient, Prisma } from '@prisma/client';
import { RouterContext } from 'koa-router';
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

// export async function dbOperate() {
//   // ... you will write your Prisma Client queries here

//   // don't need to call prisma.$connect explicitly since it will be called lazily when you make a query.

//   try {
//     const user = await createUser({
//       name: 'Alice',
//       email: 'alice@prisma.io',
//       password: '123456',
//     });
//     console.log('user in db', prisma, user);
//     const allUsers = await prisma.user.findMany();
//     console.log('findmany result', allUsers);
//   } catch (e) {
//     if (e instanceof Prisma.PrismaClientKnownRequestError) {
//       // The .code property can be accessed in a type-safe manner
//       if (e.code === 'P2002') {
//         console.log(
//           'There is a unique constraint violation, a new user cannot be created with this email',
//         );
//       }
//     }
//     throw e;
//   }
// }

async function readUser(userInfo: UserInfo) {
  const user = await prisma.user.findUnique({
    where: {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      // password: userInfo.password,
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

async function updateUser(userInfo: UserInfo) {
  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
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

// dbOperate()
//   .then(async () => {
//     console.log('if the db init');
//     await prisma.$disconnect();
//   })
//   .catch(async (e: Prisma.PrismaClientKnownRequestError) => {
//     console.error('prisma error :=====> ', JSON.stringify(e, null, 2));
//     await prisma.$disconnect();
//     process.exit(1);
//   });

export class DBController {
  constructor() {
    // self disconnect
    prisma.$on('error', () => {
      prisma.$disconnect();
    });
  }

  private async safeOperation(
    method: RequestMethod,
    info: UserInfo,
  ): Promise<UserInfo | undefined | null> {
    try {
      switch (method) {
        case 'post':
          return createUser(info);
        case 'put':
          return updateUser(info);
        case 'delete':
          return deleteUser(info);
        case 'get':
          return readUser(info);
        default:
          return;
      }
    } catch (error) {
      console.log('error: ===>', error);

      return;
    }
  }

  async getUser(ctx: RouterContext, userInfo: UserInfo) {
    const user = await this.safeOperation('get', userInfo);

    console.log('getUser', user);

    return user;
  }

  async createUser(ctx: RouterContext, userInfo: UserInfo) {
    const user = await this.safeOperation('post', userInfo);

    console.log('createUser', user);
    // ctx.response.body = user?.id;
    return user;
  }

  async updateUser(ctx: RouterContext, userInfo: UserInfo) {
    const result = await this.safeOperation('put', userInfo);
    console.log('update user', result);
    return result;
  }

  async deleteUser(ctx: RouterContext, userInfo: UserInfo) {
    const result = await this.safeOperation('delete', userInfo);
    console.log('delete user', result);
    return result;
  }
}

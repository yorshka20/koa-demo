import { PrismaClient, Prisma } from '@prisma/client';
import { RouterContext } from 'koa-router';
import { UserInfo } from './types';
// import { prismaConfig } from './constants';

const prismaConfig: Prisma.PrismaClientOptions = {
  log: ['query', 'info', 'warn', 'error'],
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient(prismaConfig);
  }

  // @ts-ignore
  prisma = global.prisma;
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
    // @ts-ignore
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

function genName() {
  return Math.random().toString(36).substring(2, 10);
}

export class DBController {
  static instance: DBController;
  static client: PrismaClient;

  constructor() {
    if (DBController.instance) {
      return DBController.instance;
    }

    DBController.instance = this;
    DBController.client = new PrismaClient(prismaConfig);
    return DBController.instance;
  }

  private async safeOperation(
    method: string,
    info: UserInfo,
  ): Promise<UserInfo | undefined | null> {
    try {
      switch (method) {
        case 'post':
          return createUser(info);
        case 'update':
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

    if (user) {
      console.log('getUser', user);

      ctx.response.body = user.id;
    }
  }

  async createUser(ctx: RouterContext, userInfo: UserInfo) {
    const user = await this.safeOperation('post', {
      ...userInfo,
    });
    if (user) {
      console.log('createUser', user);
    }

    ctx.response.body = user?.id;
  }
}

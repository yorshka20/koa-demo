import { PrismaClient, Prisma } from '@prisma/client';

import { UserInfo } from './types';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

async function dbOperate() {
  // ... you will write your Prisma Client queries here

  // don't need to call prisma.$connect explicitly since it will be called lazily when you make a query.

  try {
    const user = createUser({
      name: 'Alice',
      email: 'alice@prisma.io',
      password: '123456',
    });
    console.log('user in db', prisma, user);
    const allUsers = await prisma.user.findMany();
    console.log('findmany result', allUsers);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this email',
        );
      }
    }
    throw e;
  }
}

async function createUser(userInfo: UserInfo) {
  const user = await prisma.user.create({
    data: {
      name: userInfo.name,
      email: userInfo.email,
      password: userInfo.password,
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

dbOperate()
  .then(async () => {
    console.log('if the db init');
    await prisma.$disconnect();
  })
  .catch(async (e: Prisma.PrismaClientKnownRequestError) => {
    console.error('prisma error :=====> ', JSON.stringify(e, null, 2));
    await prisma.$disconnect();
    process.exit(1);
  });

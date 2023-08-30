import { PrismaClient } from '@prisma/client';

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

async function main() {
  // ... you will write your Prisma Client queries here

  // don't need to call prisma.$connect explicitly since it will be called lazily when you make a query.
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      password: '123456',
    },
  });
  console.log('user in db', prisma, user);
  const allUsers = await prisma.user.findMany();
  console.log('findmany result', allUsers);
}

main()
  .then(async () => {
    console.log('if the db init');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

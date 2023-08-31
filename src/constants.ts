import type { Prisma } from '@prisma/client';
import dotenv from 'dotenv';

const config = dotenv.config().parsed || {};

export const prismaConfig: Prisma.PrismaClientOptions = {
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
};

// jwt secret
export const JWT_SECRET = config['JWT_SECRET'];

// server port
export const PORT = config['PORT'] || 3000;

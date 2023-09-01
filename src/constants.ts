import dotenv from 'dotenv';

// .env config
const config = dotenv.config().parsed || {};

// jwt secret
export const JWT_SECRET = config['JWT_SECRET'];

// server port
export const PORT = config['PORT'] || 3000;

// input invalid error. specific error
export const INVALID_INPUT_ERROR = 'INVALID_INPUT_ERROR';

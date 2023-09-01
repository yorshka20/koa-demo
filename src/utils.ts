import isEmail from 'validator/lib/isEmail';

import { ErrorCode, ErrorMsg } from './errors';
import type { UserInfo } from './types';

export function validateCreateUser(userInfo: UserInfo) {
  if (!userInfo.name || typeof userInfo.name !== 'string') {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'name'),
    };
  }
  if (!userInfo.email || !isEmail(userInfo.email)) {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'mail'),
    };
  }
  if (!userInfo.password || typeof userInfo.password !== 'string') {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'password'),
    };
  }
  return {
    code: ErrorCode.NO_ERROR,
    msg: '',
  };
}

export function validateUpdateUser(userInfo: UserInfo) {
  if (userInfo.name && typeof userInfo.name !== 'string') {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'name'),
    };
  }
  if (userInfo.email && !isEmail(userInfo.email)) {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'email'),
    };
  }
  if (userInfo.password && typeof userInfo.password !== 'string') {
    return {
      code: ErrorCode.INVALID_INPUT,
      msg: ErrorMsg.INVALID_INPUT.replace('$d', 'password'),
    };
  }
  return { code: ErrorCode.NO_ERROR, msg: '' };
}

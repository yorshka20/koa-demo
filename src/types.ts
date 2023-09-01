export interface UserInfo {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartialUserInfo = Partial<UserInfo>;

export type RequestMethod = 'get' | 'post' | 'put' | 'delete';

export type RouterNext = () => Promise<any>;

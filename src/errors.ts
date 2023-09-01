export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
}

export enum ErrorCode {
  /* normal state. with code 0 */
  NO_ERROR,
  /* unrecognized error */
  UNKNOWN_ERROR,
  /* error occurred in db */
  DB_ERROR,
  /* request input invalid */
  INVALID_INPUT,
}

export enum ErrorMsg {
  NAME_EMPTY = 'user name can not be empty',
  ID_EMPTY = 'user id can not be empty',
  INVALID_INPUT = '$d input invalid',
}

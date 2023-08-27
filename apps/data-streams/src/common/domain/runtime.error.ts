import { HttpStatus } from '@nestjs/common';

export class RuntimeError extends Error {
  public statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(
    public message: string,
    public data?: any,
  ) {
    super(message);
  }
}

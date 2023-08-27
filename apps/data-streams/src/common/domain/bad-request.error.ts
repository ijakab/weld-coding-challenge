import { RuntimeError } from './runtime.error';
import { HttpStatus } from '@nestjs/common';

export class BadRequestError extends RuntimeError {
  public statusCode = HttpStatus.BAD_REQUEST;
}

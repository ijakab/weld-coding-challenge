import { RuntimeError } from './runtime.error';
import { HttpStatus } from '@nestjs/common';

export class NotFoundError extends RuntimeError {
  public statusCode = HttpStatus.NOT_FOUND;
}

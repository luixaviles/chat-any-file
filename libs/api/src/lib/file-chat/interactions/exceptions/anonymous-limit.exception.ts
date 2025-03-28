import { HttpException, HttpStatus } from '@nestjs/common';

export class AnonymousLimitException extends HttpException {
  constructor() {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'ANONYMOUS_LIMIT_EXCEEDED',
        message: 'Anonymous user has exceeded the maximum number of interactions. Please login to continue.',
      },
      HttpStatus.FORBIDDEN
    );
  }
}
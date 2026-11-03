import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    readonly codigo: string,
  ) {
    super(message, status);
  }
}

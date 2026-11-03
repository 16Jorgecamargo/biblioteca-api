import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../comum/api.exception.js';

export class MatriculaDuplicadaException extends ApiException {
  constructor(matricula: string) {
    super(
      `Matrícula ${matricula} já cadastrada`,
      HttpStatus.CONFLICT,
      'MATRICULA_DUPLICADA',
    );
  }
}

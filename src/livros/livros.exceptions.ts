import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../comum/api.exception.js';

export class LivroComEmprestimoAbertoException extends ApiException {
  constructor(livroId: number) {
    super(
      `Livro ${livroId} possui empréstimo em aberto`,
      HttpStatus.CONFLICT,
      'LIVRO_COM_EMPRESTIMO_ABERTO',
    );
  }
}

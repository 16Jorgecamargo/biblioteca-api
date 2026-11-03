import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../comum/api.exception.js';

export class SemExemplarException extends ApiException {
  constructor(livroId: number) {
    super(
      `Livro ${livroId} sem exemplar disponível`,
      HttpStatus.CONFLICT,
      'SEM_EXEMPLAR',
    );
  }
}

export class LimiteEmprestimosException extends ApiException {
  constructor(leitorId: number, limite: number) {
    super(
      `Leitor ${leitorId} atingiu o limite de ${limite} empréstimos em aberto`,
      HttpStatus.CONFLICT,
      'LIMITE_EMPRESTIMOS',
    );
  }
}

export class JaDevolvidoException extends ApiException {
  constructor(emprestimoId: number) {
    super(
      `Empréstimo ${emprestimoId} já foi devolvido`,
      HttpStatus.CONFLICT,
      'JA_DEVOLVIDO',
    );
  }
}

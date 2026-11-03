import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import type { EmprestimoStatus } from './dto/list-emprestimos-query.dto.js';
import { Emprestimo } from './emprestimo.entity.js';

export interface NewEmprestimo {
  livroId: number;
  leitorId: number;
  dataRetirada: string;
  dataPrevista: string;
}

const DEVOLUCAO_BY_STATUS = {
  aberto: IsNull(),
  devolvido: Not(IsNull()),
};

@Injectable()
export class EmprestimosRepository {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly repository: Repository<Emprestimo>,
  ) {}

  async findById(id: number): Promise<Emprestimo | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByLeitor(
    leitorId: number,
    status?: EmprestimoStatus,
  ): Promise<Emprestimo[]> {
    return await this.repository.find({
      where: status
        ? { leitorId, dataDevolucao: DEVOLUCAO_BY_STATUS[status] }
        : { leitorId },
      relations: { livro: true },
      order: { id: 'ASC' },
    });
  }

  async countOpenByLivro(livroId: number): Promise<number> {
    return await this.repository.countBy({
      livroId,
      dataDevolucao: IsNull(),
    });
  }

  async countOpenByLeitor(leitorId: number): Promise<number> {
    return await this.repository.countBy({
      leitorId,
      dataDevolucao: IsNull(),
    });
  }

  async create(dados: NewEmprestimo): Promise<Emprestimo> {
    return await this.repository.save(this.repository.create(dados));
  }

  async save(emprestimo: Emprestimo): Promise<Emprestimo> {
    return await this.repository.save(emprestimo);
  }
}

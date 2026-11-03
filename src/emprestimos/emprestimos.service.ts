import { Injectable, NotFoundException } from '@nestjs/common';
import { addDays, daysBetween, toIsoDate } from '../comum/date.utils.js';
import { LeitoresService } from '../leitores/leitores.service.js';
import { LivrosService } from '../livros/livros.service.js';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto.js';
import type { EmprestimoStatus } from './dto/list-emprestimos-query.dto.js';
import { Emprestimo } from './emprestimo.entity.js';
import {
  JaDevolvidoException,
  LimiteEmprestimosException,
  SemExemplarException,
} from './emprestimos.exceptions.js';
import { EmprestimosRepository } from './emprestimos.repository.js';

const LIMITE_EMPRESTIMOS_ABERTOS = 3;
const PRAZO_DEVOLUCAO_DIAS = 14;
const MULTA_POR_DIA = 1;

@Injectable()
export class EmprestimosService {
  constructor(
    private readonly emprestimosRepository: EmprestimosRepository,
    private readonly livrosService: LivrosService,
    private readonly leitoresService: LeitoresService,
  ) {}

  async findByLeitor(
    leitorId: number,
    status?: EmprestimoStatus,
  ): Promise<Emprestimo[]> {
    await this.leitoresService.findOne(leitorId);
    return await this.emprestimosRepository.findByLeitor(leitorId, status);
  }

  async create({
    livroId,
    leitorId,
  }: CreateEmprestimoDto): Promise<Emprestimo> {
    const livro = await this.livrosService.findOne(livroId);
    await this.leitoresService.findOne(leitorId);

    const abertosDoLivro =
      await this.emprestimosRepository.countOpenByLivro(livroId);
    if (livro.exemplares - abertosDoLivro <= 0) {
      throw new SemExemplarException(livroId);
    }

    const abertosDoLeitor =
      await this.emprestimosRepository.countOpenByLeitor(leitorId);
    if (abertosDoLeitor >= LIMITE_EMPRESTIMOS_ABERTOS) {
      throw new LimiteEmprestimosException(
        leitorId,
        LIMITE_EMPRESTIMOS_ABERTOS,
      );
    }

    const dataRetirada = toIsoDate(new Date());
    return await this.emprestimosRepository.create({
      livroId,
      leitorId,
      dataRetirada,
      dataPrevista: addDays(dataRetirada, PRAZO_DEVOLUCAO_DIAS),
    });
  }

  async registerDevolucao(id: number): Promise<Emprestimo> {
    const emprestimo = await this.emprestimosRepository.findById(id);
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo ${id} não encontrado`);
    }
    if (emprestimo.dataDevolucao) {
      throw new JaDevolvidoException(id);
    }

    const dataDevolucao = toIsoDate(new Date());
    const diasDeAtraso = daysBetween(emprestimo.dataPrevista, dataDevolucao);
    emprestimo.dataDevolucao = dataDevolucao;
    emprestimo.multa = Math.max(0, diasDeAtraso) * MULTA_POR_DIA;

    return await this.emprestimosRepository.save(emprestimo);
  }
}

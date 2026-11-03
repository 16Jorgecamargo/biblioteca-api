import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeitorDto } from './dto/create-leitor.dto.js';
import { Leitor } from './leitor.entity.js';
import { MatriculaDuplicadaException } from './leitores.exceptions.js';
import { LeitoresRepository } from './leitores.repository.js';

@Injectable()
export class LeitoresService {
  constructor(private readonly leitoresRepository: LeitoresRepository) {}

  async findOne(id: number): Promise<Leitor> {
    const leitor = await this.leitoresRepository.findById(id);
    if (!leitor) {
      throw new NotFoundException(`Leitor ${id} não encontrado`);
    }
    return leitor;
  }

  async create(dados: CreateLeitorDto): Promise<Leitor> {
    const existente = await this.leitoresRepository.findByMatricula(
      dados.matricula,
    );
    if (existente) {
      throw new MatriculaDuplicadaException(dados.matricula);
    }
    return await this.leitoresRepository.create(dados);
  }
}

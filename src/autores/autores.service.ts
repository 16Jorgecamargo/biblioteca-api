import { Injectable, NotFoundException } from '@nestjs/common';
import { Autor } from './autor.entity.js';
import { AutoresRepository } from './autores.repository.js';
import { CreateAutorDto } from './dto/create-autor.dto.js';

@Injectable()
export class AutoresService {
  constructor(private readonly autoresRepository: AutoresRepository) {}

  async findAll(): Promise<Autor[]> {
    return await this.autoresRepository.findAll();
  }

  async findOne(id: number): Promise<Autor> {
    const autor = await this.autoresRepository.findById(id);
    if (!autor) {
      throw new NotFoundException(`Autor ${id} não encontrado`);
    }
    return autor;
  }

  async create(dados: CreateAutorDto): Promise<Autor> {
    return await this.autoresRepository.create(dados);
  }
}

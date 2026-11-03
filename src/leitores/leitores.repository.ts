import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeitorDto } from './dto/create-leitor.dto.js';
import { Leitor } from './leitor.entity.js';

@Injectable()
export class LeitoresRepository {
  constructor(
    @InjectRepository(Leitor)
    private readonly repository: Repository<Leitor>,
  ) {}

  async findById(id: number): Promise<Leitor | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByMatricula(matricula: string): Promise<Leitor | null> {
    return await this.repository.findOneBy({ matricula });
  }

  async create(dados: CreateLeitorDto): Promise<Leitor> {
    return await this.repository.save(this.repository.create(dados));
  }
}

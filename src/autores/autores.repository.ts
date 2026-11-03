import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Autor } from './autor.entity.js';
import { CreateAutorDto } from './dto/create-autor.dto.js';

@Injectable()
export class AutoresRepository {
  constructor(
    @InjectRepository(Autor)
    private readonly repository: Repository<Autor>,
  ) {}

  async findAll(): Promise<Autor[]> {
    return await this.repository.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<Autor | null> {
    return await this.repository.findOneBy({ id });
  }

  async create(dados: CreateAutorDto): Promise<Autor> {
    return await this.repository.save(this.repository.create(dados));
  }
}

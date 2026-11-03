import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';

@Injectable()
export class CategoriasRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return await this.repository.find({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<Categoria | null> {
    return await this.repository.findOneBy({ id });
  }

  async create(dados: CreateCategoriaDto): Promise<Categoria> {
    return await this.repository.save(this.repository.create(dados));
  }
}

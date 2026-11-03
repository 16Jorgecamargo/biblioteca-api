import { Injectable, NotFoundException } from '@nestjs/common';
import { Categoria } from './categoria.entity.js';
import { CategoriasRepository } from './categorias.repository.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  async findAll(): Promise<Categoria[]> {
    return await this.categoriasRepository.findAll();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoria ${id} não encontrada`);
    }
    return categoria;
  }

  async create(dados: CreateCategoriaDto): Promise<Categoria> {
    return await this.categoriasRepository.create(dados);
  }
}

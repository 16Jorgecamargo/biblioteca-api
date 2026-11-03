import { Injectable, NotFoundException } from '@nestjs/common';
import { AutoresService } from '../autores/autores.service.js';
import { CategoriasService } from '../categorias/categorias.service.js';
import { CreateLivroDto } from './dto/create-livro.dto.js';
import { ListLivrosQueryDto } from './dto/list-livros-query.dto.js';
import { UpdateLivroDto } from './dto/update-livro.dto.js';
import { Livro } from './livro.entity.js';
import { LivroComEmprestimoAbertoException } from './livros.exceptions.js';
import { LivrosRepository } from './livros.repository.js';

@Injectable()
export class LivrosService {
  constructor(
    private readonly livrosRepository: LivrosRepository,
    private readonly autoresService: AutoresService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async findAll(filtros: ListLivrosQueryDto): Promise<Livro[]> {
    return await this.livrosRepository.findAll(filtros);
  }

  async findOne(id: number): Promise<Livro> {
    const livro = await this.livrosRepository.findById(id);
    if (!livro) {
      throw new NotFoundException(`Livro ${id} não encontrado`);
    }
    return livro;
  }

  async create(dados: CreateLivroDto): Promise<Livro> {
    await this.autoresService.findOne(dados.autorId);
    await this.categoriasService.findOne(dados.categoriaId);
    return await this.livrosRepository.create(dados);
  }

  async update(id: number, dados: UpdateLivroDto): Promise<Livro> {
    await this.findOne(id);
    if (dados.autorId !== undefined) {
      await this.autoresService.findOne(dados.autorId);
    }
    if (dados.categoriaId !== undefined) {
      await this.categoriasService.findOne(dados.categoriaId);
    }
    await this.livrosRepository.update(id, dados);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    if (await this.livrosRepository.hasOpenEmprestimos(id)) {
      throw new LivroComEmprestimoAbertoException(id);
    }
    await this.livrosRepository.remove(id);
  }
}

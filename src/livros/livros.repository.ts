import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from '../emprestimos/emprestimo.entity.js';
import { CreateLivroDto } from './dto/create-livro.dto.js';
import { ListLivrosQueryDto } from './dto/list-livros-query.dto.js';
import { UpdateLivroDto } from './dto/update-livro.dto.js';
import { Livro } from './livro.entity.js';

@Injectable()
export class LivrosRepository {
  constructor(
    @InjectRepository(Livro)
    private readonly repository: Repository<Livro>,
  ) {}

  async findAll(filtros: ListLivrosQueryDto): Promise<Livro[]> {
    const query = this.repository
      .createQueryBuilder('livro')
      .leftJoinAndSelect('livro.autor', 'autor')
      .leftJoinAndSelect('livro.categoria', 'categoria')
      .orderBy('livro.id', 'ASC');

    if (filtros.categoria !== undefined) {
      query.andWhere('livro.categoriaId = :categoriaId', {
        categoriaId: filtros.categoria,
      });
    }

    if (filtros.autor !== undefined) {
      query.andWhere('livro.autorId = :autorId', { autorId: filtros.autor });
    }

    if (filtros.disponivel !== undefined) {
      const openEmprestimos = query
        .subQuery()
        .select('COUNT(*)')
        .from(Emprestimo, 'emprestimo')
        .where('emprestimo.livroId = livro.id')
        .andWhere('emprestimo.dataDevolucao IS NULL')
        .getQuery();
      const operator = filtros.disponivel ? '>' : '<=';
      query.andWhere(`livro.exemplares ${operator} ${openEmprestimos}`);
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Livro | null> {
    return await this.repository.findOne({
      where: { id },
      relations: { autor: true, categoria: true },
    });
  }

  async hasOpenEmprestimos(id: number): Promise<boolean> {
    return await this.repository
      .createQueryBuilder('livro')
      .innerJoin(
        'livro.emprestimos',
        'emprestimo',
        'emprestimo.dataDevolucao IS NULL',
      )
      .where('livro.id = :id', { id })
      .getExists();
  }

  async create(dados: CreateLivroDto): Promise<Livro> {
    return await this.repository.save(this.repository.create(dados));
  }

  async update(id: number, dados: UpdateLivroDto): Promise<void> {
    await this.repository.save(Object.assign({ id }, dados));
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

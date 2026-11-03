import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoresModule } from '../autores/autores.module.js';
import { CategoriasModule } from '../categorias/categorias.module.js';
import { Livro } from './livro.entity.js';
import { LivrosController } from './livros.controller.js';
import { LivrosRepository } from './livros.repository.js';
import { LivrosService } from './livros.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Livro]), AutoresModule, CategoriasModule],
  controllers: [LivrosController],
  providers: [LivrosService, LivrosRepository],
  exports: [LivrosService],
})
export class LivrosModule {}

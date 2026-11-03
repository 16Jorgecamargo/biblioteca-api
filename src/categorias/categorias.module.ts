import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './categoria.entity.js';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasRepository } from './categorias.repository.js';
import { CategoriasService } from './categorias.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasRepository],
  exports: [CategoriasService],
})
export class CategoriasModule {}

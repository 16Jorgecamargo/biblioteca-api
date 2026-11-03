import { Body, Controller, Get, Post } from '@nestjs/common';
import { Categoria } from './categoria.entity.js';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll(): Promise<Categoria[]> {
    return this.categoriasService.findAll();
  }

  @Post()
  create(@Body() dados: CreateCategoriaDto): Promise<Categoria> {
    return this.categoriasService.create(dados);
  }
}

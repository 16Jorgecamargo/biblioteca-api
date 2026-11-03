import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLivroDto } from './dto/create-livro.dto.js';
import { ListLivrosQueryDto } from './dto/list-livros-query.dto.js';
import { UpdateLivroDto } from './dto/update-livro.dto.js';
import { Livro } from './livro.entity.js';
import { LivrosService } from './livros.service.js';

@Controller('livros')
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  @Get()
  findAll(@Query() filtros: ListLivrosQueryDto): Promise<Livro[]> {
    return this.livrosService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Livro> {
    return this.livrosService.findOne(id);
  }

  @Post()
  create(@Body() dados: CreateLivroDto): Promise<Livro> {
    return this.livrosService.create(dados);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateLivroDto,
  ): Promise<Livro> {
    return this.livrosService.update(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.livrosService.remove(id);
  }
}

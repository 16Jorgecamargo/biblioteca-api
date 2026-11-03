import { Body, Controller, Get, Post } from '@nestjs/common';
import { Autor } from './autor.entity.js';
import { AutoresService } from './autores.service.js';
import { CreateAutorDto } from './dto/create-autor.dto.js';

@Controller('autores')
export class AutoresController {
  constructor(private readonly autoresService: AutoresService) {}

  @Get()
  findAll(): Promise<Autor[]> {
    return this.autoresService.findAll();
  }

  @Post()
  create(@Body() dados: CreateAutorDto): Promise<Autor> {
    return this.autoresService.create(dados);
  }
}

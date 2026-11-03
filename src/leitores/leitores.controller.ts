import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeitorDto } from './dto/create-leitor.dto.js';
import { Leitor } from './leitor.entity.js';
import { LeitoresService } from './leitores.service.js';

@Controller('leitores')
export class LeitoresController {
  constructor(private readonly leitoresService: LeitoresService) {}

  @Post()
  create(@Body() dados: CreateLeitorDto): Promise<Leitor> {
    return this.leitoresService.create(dados);
  }
}

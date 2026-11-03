import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto.js';
import { Emprestimo } from './emprestimo.entity.js';
import { EmprestimosService } from './emprestimos.service.js';

@Controller('emprestimos')
export class EmprestimosController {
  constructor(private readonly emprestimosService: EmprestimosService) {}

  @Post()
  create(@Body() dados: CreateEmprestimoDto): Promise<Emprestimo> {
    return this.emprestimosService.create(dados);
  }

  @Patch(':id/devolucao')
  registerDevolucao(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Emprestimo> {
    return this.emprestimosService.registerDevolucao(id);
  }
}

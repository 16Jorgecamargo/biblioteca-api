import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ListEmprestimosQueryDto } from './dto/list-emprestimos-query.dto.js';
import { Emprestimo } from './emprestimo.entity.js';
import { EmprestimosService } from './emprestimos.service.js';

@Controller('leitores/:id/emprestimos')
export class LeitorEmprestimosController {
  constructor(private readonly emprestimosService: EmprestimosService) {}

  @Get()
  findByLeitor(
    @Param('id', ParseIntPipe) id: number,
    @Query() filtros: ListEmprestimosQueryDto,
  ): Promise<Emprestimo[]> {
    return this.emprestimosService.findByLeitor(id, filtros.status);
  }
}

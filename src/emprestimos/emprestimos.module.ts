import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeitoresModule } from '../leitores/leitores.module.js';
import { LivrosModule } from '../livros/livros.module.js';
import { Emprestimo } from './emprestimo.entity.js';
import { EmprestimosController } from './emprestimos.controller.js';
import { EmprestimosRepository } from './emprestimos.repository.js';
import { EmprestimosService } from './emprestimos.service.js';
import { LeitorEmprestimosController } from './leitor-emprestimos.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emprestimo]),
    LivrosModule,
    LeitoresModule,
  ],
  controllers: [EmprestimosController, LeitorEmprestimosController],
  providers: [EmprestimosService, EmprestimosRepository],
})
export class EmprestimosModule {}

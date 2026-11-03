import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leitor } from './leitor.entity.js';
import { LeitoresController } from './leitores.controller.js';
import { LeitoresRepository } from './leitores.repository.js';
import { LeitoresService } from './leitores.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Leitor])],
  controllers: [LeitoresController],
  providers: [LeitoresService, LeitoresRepository],
  exports: [LeitoresService],
})
export class LeitoresModule {}

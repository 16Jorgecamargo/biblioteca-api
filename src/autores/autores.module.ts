import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Autor } from './autor.entity.js';
import { AutoresController } from './autores.controller.js';
import { AutoresRepository } from './autores.repository.js';
import { AutoresService } from './autores.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Autor])],
  controllers: [AutoresController],
  providers: [AutoresService, AutoresRepository],
  exports: [AutoresService],
})
export class AutoresModule {}

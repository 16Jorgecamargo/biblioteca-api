import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { Autor } from './autores/autor.entity.js';
import { Categoria } from './categorias/categoria.entity.js';
import { addDays, toIsoDate } from './comum/date.utils.js';
import { Emprestimo } from './emprestimos/emprestimo.entity.js';
import { Leitor } from './leitores/leitor.entity.js';
import { Livro } from './livros/livro.entity.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const dataSource = app.get(DataSource);
  const today = toIsoDate(new Date());

  await dataSource.synchronize(true);

  await dataSource
    .getRepository(Autor)
    .save([
      { nome: 'Machado de Assis' },
      { nome: 'Clarice Lispector' },
      { nome: 'Graciliano Ramos' },
    ]);

  await dataSource
    .getRepository(Categoria)
    .save([{ nome: 'Romance' }, { nome: 'Conto' }]);

  await dataSource.getRepository(Livro).save([
    { titulo: 'Dom Casmurro', exemplares: 3, autorId: 1, categoriaId: 1 },
    { titulo: 'A Hora da Estrela', exemplares: 1, autorId: 2, categoriaId: 1 },
    { titulo: 'Vidas Secas', exemplares: 3, autorId: 3, categoriaId: 1 },
    { titulo: 'O Alienista', exemplares: 3, autorId: 1, categoriaId: 2 },
    { titulo: 'Quincas Borba', exemplares: 2, autorId: 1, categoriaId: 1 },
  ]);

  await dataSource.getRepository(Leitor).save([
    { nome: 'Ana Souza', matricula: '20260001', email: 'ana@escola.br' },
    { nome: 'Bruno Lima', matricula: '20260002', email: 'bruno@escola.br' },
    { nome: 'Carla Dias', matricula: '20260003', email: 'carla@escola.br' },
  ]);

  await dataSource.getRepository(Emprestimo).save([
    {
      livroId: 2,
      leitorId: 2,
      dataRetirada: addDays(today, -3),
      dataPrevista: addDays(today, 11),
    },
    {
      livroId: 3,
      leitorId: 2,
      dataRetirada: addDays(today, -3),
      dataPrevista: addDays(today, 11),
    },
    {
      livroId: 4,
      leitorId: 2,
      dataRetirada: addDays(today, -3),
      dataPrevista: addDays(today, 11),
    },
    {
      livroId: 1,
      leitorId: 3,
      dataRetirada: addDays(today, -20),
      dataPrevista: addDays(today, -6),
    },
    {
      livroId: 3,
      leitorId: 3,
      dataRetirada: addDays(today, -30),
      dataPrevista: addDays(today, -16),
      dataDevolucao: addDays(today, -20),
    },
  ]);

  await app.close();
}
await seed();

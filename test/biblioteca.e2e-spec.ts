import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';

function isoDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

describe('API da biblioteca', () => {
  let app: INestApplication<App>;
  let leitorSequence = 0;

  const http = () => request(app.getHttpServer());

  const createAutor = async (nome = 'Machado de Assis') =>
    (await http().post('/autores').send({ nome }).expect(201)).body.dados;

  const createCategoria = async (nome = 'Romance') =>
    (await http().post('/categorias').send({ nome }).expect(201)).body.dados;

  const createLeitor = async () => {
    leitorSequence += 1;
    const response = await http()
      .post('/leitores')
      .send({
        nome: `Leitor ${leitorSequence}`,
        matricula: `2026${leitorSequence}`,
        email: `leitor${leitorSequence}@escola.br`,
      })
      .expect(201);
    return response.body.dados;
  };

  const createLivro = async (overrides: Record<string, unknown> = {}) => {
    const autor = await createAutor();
    const categoria = await createCategoria();
    const response = await http()
      .post('/livros')
      .send({
        titulo: 'Dom Casmurro',
        exemplares: 1,
        autorId: autor.id,
        categoriaId: categoria.id,
        ...overrides,
      })
      .expect(201);
    return response.body.dados;
  };

  const createEmprestimo = async (livroId: number, leitorId: number) =>
    (await http().post('/emprestimos').send({ livroId, leitorId }).expect(201))
      .body.dados;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    moduleRef.useLogger(false);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  describe('respostas padronizadas', () => {
    it('embrulha o sucesso em { sucesso, dados }', async () => {
      const response = await http()
        .post('/autores')
        .send({ nome: 'Clarice Lispector' })
        .expect(201);

      expect(response.body).toEqual({
        sucesso: true,
        dados: { id: 1, nome: 'Clarice Lispector' },
      });
    });

    it('monta o envelope de erro em rota inexistente', async () => {
      const response = await http().get('/rota-inexistente').expect(404);

      expect(response.body).toEqual({
        sucesso: false,
        erro: {
          status: 404,
          codigo: 'NAO_ENCONTRADO',
          mensagem: expect.any(String),
        },
        caminho: '/rota-inexistente',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T.*Z$/),
      });
    });

    it('devolve erro de validação com mensagem em texto', async () => {
      const response = await http().post('/autores').send({}).expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro.codigo).toBe('REQUISICAO_INVALIDA');
      expect(typeof response.body.erro.mensagem).toBe('string');
    });

    it('devolve 400 no envelope quando o JSON está malformado', async () => {
      const response = await http()
        .post('/autores')
        .set('Content-Type', 'application/json')
        .send('{ "nome": ')
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro.status).toBe(400);
    });

    it('esconde o detalhe de erro inesperado e registra no log', async () => {
      const errorLog = vi.spyOn(Logger.prototype, 'error');
      await app.get(DataSource).query('DROP TABLE livros');
      await app.get(DataSource).query('DROP TABLE autores');

      const response = await http().get('/autores').expect(500);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro).toEqual({
        status: 500,
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro interno do servidor',
      });
      expect(JSON.stringify(response.body)).not.toContain('no such table');
      expect(JSON.stringify(errorLog.mock.calls)).toContain('no such table');
    });
  });

  describe('middleware de log', () => {
    it('registra método, rota, status e tempo', async () => {
      const log = vi.spyOn(Logger.prototype, 'log');

      await http().get('/autores').expect(200);

      await vi.waitFor(() => {
        const lines = log.mock.calls.map(([line]) => String(line));
        expect(
          lines.some((line) => /^GET \/autores 200 \d+ms$/.test(line)),
        ).toBe(true);
      });
    });

    it('registra também as respostas de erro', async () => {
      const log = vi.spyOn(Logger.prototype, 'log');

      await http().get('/livros/999').expect(404);

      await vi.waitFor(() => {
        const lines = log.mock.calls.map(([line]) => String(line));
        expect(
          lines.some((line) => /^GET \/livros\/999 404 \d+ms$/.test(line)),
        ).toBe(true);
      });
    });
  });

  describe('/autores', () => {
    it('GET lista os autores cadastrados', async () => {
      await createAutor('Machado de Assis');
      await createAutor('Clarice Lispector');

      const response = await http().get('/autores').expect(200);

      expect(response.body.dados.map((autor: any) => autor.nome)).toEqual([
        'Machado de Assis',
        'Clarice Lispector',
      ]);
    });

    it('POST recusa nome vazio', async () => {
      await http().post('/autores').send({ nome: '' }).expect(400);
    });

    it('POST recusa campo desconhecido', async () => {
      await http()
        .post('/autores')
        .send({ nome: 'Ana', idade: 40 })
        .expect(400);
    });
  });

  describe('/categorias', () => {
    it('GET lista as categorias cadastradas', async () => {
      await createCategoria('Romance');

      const response = await http().get('/categorias').expect(200);

      expect(response.body.dados).toEqual([{ id: 1, nome: 'Romance' }]);
    });

    it('POST recusa corpo sem nome', async () => {
      await http().post('/categorias').send({}).expect(400);
    });
  });

  describe('/leitores', () => {
    const leitor = {
      nome: 'Ana Souza',
      matricula: '20260001',
      email: 'ana@escola.br',
    };

    it('POST cadastra o leitor', async () => {
      const response = await http().post('/leitores').send(leitor).expect(201);

      expect(response.body.dados).toEqual({ id: 1, ...leitor });
    });

    it('POST recusa matrícula repetida com 409', async () => {
      await http().post('/leitores').send(leitor).expect(201);

      const response = await http()
        .post('/leitores')
        .send({ ...leitor, email: 'outra@escola.br' })
        .expect(409);

      expect(response.body.erro.codigo).toBe('MATRICULA_DUPLICADA');
    });

    it('POST recusa e-mail inválido', async () => {
      await http()
        .post('/leitores')
        .send({ ...leitor, email: 'nao-e-email' })
        .expect(400);
    });
  });

  describe('/livros', () => {
    it('POST cadastra o livro', async () => {
      const autor = await createAutor();
      const categoria = await createCategoria();

      const response = await http()
        .post('/livros')
        .send({
          titulo: 'Quincas Borba',
          exemplares: 2,
          autorId: autor.id,
          categoriaId: categoria.id,
        })
        .expect(201);

      expect(response.body.dados).toMatchObject({
        id: 1,
        titulo: 'Quincas Borba',
        exemplares: 2,
        autorId: autor.id,
        categoriaId: categoria.id,
      });
    });

    it('POST recusa corpo inválido', async () => {
      await http().post('/livros').send({ titulo: 'Sem autor' }).expect(400);
    });

    it('POST exige ao menos um exemplar', async () => {
      const autor = await createAutor();
      const categoria = await createCategoria();

      await http()
        .post('/livros')
        .send({
          titulo: 'Sem exemplar',
          exemplares: 0,
          autorId: autor.id,
          categoriaId: categoria.id,
        })
        .expect(400);
    });

    it('POST devolve 404 para autor inexistente', async () => {
      const categoria = await createCategoria();

      await http()
        .post('/livros')
        .send({
          titulo: 'Órfão',
          exemplares: 1,
          autorId: 999,
          categoriaId: categoria.id,
        })
        .expect(404);
    });

    it('POST devolve 404 para categoria inexistente', async () => {
      const autor = await createAutor();

      await http()
        .post('/livros')
        .send({
          titulo: 'Órfão',
          exemplares: 1,
          autorId: autor.id,
          categoriaId: 999,
        })
        .expect(404);
    });

    it('GET lista todos os livros', async () => {
      await createLivro({ titulo: 'A' });
      await createLivro({ titulo: 'B' });

      const response = await http().get('/livros').expect(200);

      expect(response.body.dados.map((livro: any) => livro.titulo)).toEqual([
        'A',
        'B',
      ]);
    });

    it('GET filtra por categoria', async () => {
      const romance = await createLivro({ titulo: 'Romance' });
      await createLivro({ titulo: 'Outro' });

      const response = await http()
        .get(`/livros?categoria=${romance.categoriaId}`)
        .expect(200);

      expect(response.body.dados.map((livro: any) => livro.id)).toEqual([
        romance.id,
      ]);
    });

    it('GET filtra por autor', async () => {
      await createLivro({ titulo: 'Outro' });
      const procurado = await createLivro({ titulo: 'Procurado' });

      const response = await http()
        .get(`/livros?autor=${procurado.autorId}`)
        .expect(200);

      expect(response.body.dados.map((livro: any) => livro.id)).toEqual([
        procurado.id,
      ]);
    });

    it('GET com disponivel=true esconde livro sem exemplar livre', async () => {
      const esgotado = await createLivro({ titulo: 'Esgotado', exemplares: 1 });
      const livre = await createLivro({ titulo: 'Livre', exemplares: 2 });
      const leitor = await createLeitor();
      await createEmprestimo(esgotado.id, leitor.id);
      await createEmprestimo(livre.id, leitor.id);

      const response = await http().get('/livros?disponivel=true').expect(200);

      expect(response.body.dados.map((livro: any) => livro.id)).toEqual([
        livre.id,
      ]);
    });

    it('GET com disponivel=true volta a mostrar livro devolvido', async () => {
      const livro = await createLivro({ exemplares: 1 });
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);
      await http().patch(`/emprestimos/${emprestimo.id}/devolucao`).expect(200);

      const response = await http().get('/livros?disponivel=true').expect(200);

      expect(response.body.dados.map((item: any) => item.id)).toEqual([
        livro.id,
      ]);
    });

    it.each([
      '/livros?categoria=abc',
      '/livros?autor=abc',
      '/livros?disponivel=talvez',
      '/livros?desconhecido=1',
    ])('GET %s devolve 400', async (url) => {
      await http().get(url).expect(400);
    });

    it('GET /:id traz autor e categoria', async () => {
      const livro = await createLivro();

      const response = await http().get(`/livros/${livro.id}`).expect(200);

      expect(response.body.dados.autor).toEqual({
        id: livro.autorId,
        nome: 'Machado de Assis',
      });
      expect(response.body.dados.categoria).toEqual({
        id: livro.categoriaId,
        nome: 'Romance',
      });
    });

    it('GET /:id devolve 400 para id não numérico', async () => {
      await http().get('/livros/abc').expect(400);
    });

    it('GET /:id devolve 404 para livro inexistente', async () => {
      await http().get('/livros/999').expect(404);
    });

    it('PATCH altera apenas os campos enviados', async () => {
      const livro = await createLivro({ titulo: 'Antigo', exemplares: 3 });

      const response = await http()
        .patch(`/livros/${livro.id}`)
        .send({ titulo: 'Novo' })
        .expect(200);

      expect(response.body.dados).toMatchObject({
        titulo: 'Novo',
        exemplares: 3,
      });
    });

    it('PATCH troca o autor e devolve o autor novo', async () => {
      const livro = await createLivro();
      const novoAutor = await createAutor('Lima Barreto');

      const response = await http()
        .patch(`/livros/${livro.id}`)
        .send({ autorId: novoAutor.id })
        .expect(200);

      expect(response.body.dados.autor.nome).toBe('Lima Barreto');
    });

    it('PATCH com corpo vazio mantém o livro', async () => {
      const livro = await createLivro({ titulo: 'Igual' });

      const response = await http()
        .patch(`/livros/${livro.id}`)
        .send({})
        .expect(200);

      expect(response.body.dados.titulo).toBe('Igual');
    });

    it('PATCH devolve 400 para dado inválido', async () => {
      const livro = await createLivro();

      await http()
        .patch(`/livros/${livro.id}`)
        .send({ exemplares: 'muitos' })
        .expect(400);
    });

    it('PATCH devolve 404 para livro inexistente', async () => {
      await http().patch('/livros/999').send({ titulo: 'X' }).expect(404);
    });

    it('PATCH devolve 404 para autor inexistente', async () => {
      const livro = await createLivro();

      await http()
        .patch(`/livros/${livro.id}`)
        .send({ autorId: 999 })
        .expect(404);
    });

    it('DELETE remove o livro e responde 204 sem corpo', async () => {
      const livro = await createLivro();

      const response = await http().delete(`/livros/${livro.id}`).expect(204);

      expect(response.text).toBe('');
      await http().get(`/livros/${livro.id}`).expect(404);
    });

    it('DELETE devolve 404 para livro inexistente', async () => {
      await http().delete('/livros/999').expect(404);
    });

    it('R6: DELETE recusa livro com empréstimo em aberto', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      await createEmprestimo(livro.id, leitor.id);

      const response = await http().delete(`/livros/${livro.id}`).expect(409);

      expect(response.body.erro.codigo).toBe('LIVRO_COM_EMPRESTIMO_ABERTO');
      await http().get(`/livros/${livro.id}`).expect(200);
    });

    it('R6: DELETE aceita livro cujos empréstimos já voltaram', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);
      await http().patch(`/emprestimos/${emprestimo.id}/devolucao`).expect(200);

      await http().delete(`/livros/${livro.id}`).expect(204);
    });
  });

  describe('/emprestimos', () => {
    it('R3: POST calcula a retirada de hoje e a previsão em 14 dias', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();

      const response = await http()
        .post('/emprestimos')
        .send({ livroId: livro.id, leitorId: leitor.id })
        .expect(201);

      expect(response.body.dados).toMatchObject({
        livroId: livro.id,
        leitorId: leitor.id,
        dataRetirada: isoDate(),
        dataPrevista: isoDate(14),
        dataDevolucao: null,
        multa: 0,
      });
    });

    it('R3: POST recusa data prevista enviada pelo cliente', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();

      await http()
        .post('/emprestimos')
        .send({
          livroId: livro.id,
          leitorId: leitor.id,
          dataPrevista: '2030-01-01',
        })
        .expect(400);
    });

    it('POST recusa corpo inválido', async () => {
      await http().post('/emprestimos').send({ livroId: 'abc' }).expect(400);
    });

    it('POST devolve 404 para livro inexistente', async () => {
      const leitor = await createLeitor();

      await http()
        .post('/emprestimos')
        .send({ livroId: 999, leitorId: leitor.id })
        .expect(404);
    });

    it('POST devolve 404 para leitor inexistente', async () => {
      const livro = await createLivro();

      await http()
        .post('/emprestimos')
        .send({ livroId: livro.id, leitorId: 999 })
        .expect(404);
    });

    it('R1: POST recusa livro sem exemplar disponível', async () => {
      const livro = await createLivro({ exemplares: 1 });
      await createEmprestimo(livro.id, (await createLeitor()).id);
      const segundoLeitor = await createLeitor();

      const response = await http()
        .post('/emprestimos')
        .send({ livroId: livro.id, leitorId: segundoLeitor.id })
        .expect(409);

      expect(response.body.erro).toEqual({
        status: 409,
        codigo: 'SEM_EXEMPLAR',
        mensagem: `Livro ${livro.id} sem exemplar disponível`,
      });
      expect(response.body.caminho).toBe('/emprestimos');
    });

    it('R1: POST aceita de novo depois da devolução', async () => {
      const livro = await createLivro({ exemplares: 1 });
      const emprestimo = await createEmprestimo(
        livro.id,
        (await createLeitor()).id,
      );
      await http().patch(`/emprestimos/${emprestimo.id}/devolucao`).expect(200);

      await createEmprestimo(livro.id, (await createLeitor()).id);
    });

    it('R2: POST recusa o quarto empréstimo em aberto do leitor', async () => {
      const leitor = await createLeitor();
      for (let index = 0; index < 3; index += 1) {
        const livro = await createLivro();
        await createEmprestimo(livro.id, leitor.id);
      }
      const quartoLivro = await createLivro();

      const response = await http()
        .post('/emprestimos')
        .send({ livroId: quartoLivro.id, leitorId: leitor.id })
        .expect(409);

      expect(response.body.erro.codigo).toBe('LIMITE_EMPRESTIMOS');
    });

    it('R2: empréstimo devolvido não conta para o limite', async () => {
      const leitor = await createLeitor();
      const emprestimos = [];
      for (let index = 0; index < 3; index += 1) {
        const livro = await createLivro();
        emprestimos.push(await createEmprestimo(livro.id, leitor.id));
      }
      await http()
        .patch(`/emprestimos/${emprestimos[0].id}/devolucao`)
        .expect(200);

      const livro = await createLivro();
      await createEmprestimo(livro.id, leitor.id);
    });

    it('PATCH devolucao no prazo registra a data e não gera multa', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);

      const response = await http()
        .patch(`/emprestimos/${emprestimo.id}/devolucao`)
        .expect(200);

      expect(response.body.dados).toMatchObject({
        id: emprestimo.id,
        dataDevolucao: isoDate(),
        multa: 0,
      });
    });

    it('R4: PATCH devolucao atrasada cobra R$ 1,00 por dia', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);
      await app
        .get(DataSource)
        .query('UPDATE emprestimos SET data_prevista = ? WHERE id = ?', [
          isoDate(-5),
          emprestimo.id,
        ]);

      const response = await http()
        .patch(`/emprestimos/${emprestimo.id}/devolucao`)
        .expect(200);

      expect(response.body.dados.multa).toBe(5);
    });

    it('R4: a multa fica salva no empréstimo', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);
      await app
        .get(DataSource)
        .query('UPDATE emprestimos SET data_prevista = ? WHERE id = ?', [
          isoDate(-2),
          emprestimo.id,
        ]);
      await http().patch(`/emprestimos/${emprestimo.id}/devolucao`).expect(200);

      const response = await http()
        .get(`/leitores/${leitor.id}/emprestimos`)
        .expect(200);

      expect(response.body.dados[0].multa).toBe(2);
    });

    it('R5: PATCH devolucao recusa empréstimo já devolvido', async () => {
      const livro = await createLivro();
      const leitor = await createLeitor();
      const emprestimo = await createEmprestimo(livro.id, leitor.id);
      await http().patch(`/emprestimos/${emprestimo.id}/devolucao`).expect(200);

      const response = await http()
        .patch(`/emprestimos/${emprestimo.id}/devolucao`)
        .expect(409);

      expect(response.body.erro.codigo).toBe('JA_DEVOLVIDO');
    });

    it('PATCH devolucao devolve 404 para empréstimo inexistente', async () => {
      await http().patch('/emprestimos/999/devolucao').expect(404);
    });

    it('PATCH devolucao devolve 400 para id não numérico', async () => {
      await http().patch('/emprestimos/abc/devolucao').expect(400);
    });
  });

  describe('/leitores/:id/emprestimos', () => {
    it('GET lista todos os empréstimos do leitor', async () => {
      const leitor = await createLeitor();
      const outroLeitor = await createLeitor();
      const livro = await createLivro({ exemplares: 3 });
      const primeiro = await createEmprestimo(livro.id, leitor.id);
      await createEmprestimo(livro.id, outroLeitor.id);

      const response = await http()
        .get(`/leitores/${leitor.id}/emprestimos`)
        .expect(200);

      expect(response.body.dados.map((item: any) => item.id)).toEqual([
        primeiro.id,
      ]);
      expect(response.body.dados[0].livro.titulo).toBe('Dom Casmurro');
    });

    it('GET com status=aberto traz só os não devolvidos', async () => {
      const leitor = await createLeitor();
      const devolvido = await createEmprestimo(
        (await createLivro()).id,
        leitor.id,
      );
      const aberto = await createEmprestimo(
        (await createLivro()).id,
        leitor.id,
      );
      await http().patch(`/emprestimos/${devolvido.id}/devolucao`).expect(200);

      const response = await http()
        .get(`/leitores/${leitor.id}/emprestimos?status=aberto`)
        .expect(200);

      expect(response.body.dados.map((item: any) => item.id)).toEqual([
        aberto.id,
      ]);
    });

    it('GET devolve 400 para status inválido', async () => {
      const leitor = await createLeitor();

      await http()
        .get(`/leitores/${leitor.id}/emprestimos?status=perdido`)
        .expect(400);
    });

    it('GET devolve 404 para leitor inexistente', async () => {
      await http().get('/leitores/999/emprestimos').expect(404);
    });

    it('GET devolve 400 para id não numérico', async () => {
      await http().get('/leitores/abc/emprestimos').expect(400);
    });
  });
});

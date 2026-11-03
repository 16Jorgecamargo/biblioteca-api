import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Livro } from '../livros/livro.entity.js';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @OneToMany(() => Livro, (livro) => livro.categoria)
  livros: Livro[];
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Livro } from '../livros/livro.entity.js';

@Entity('autores')
export class Autor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @OneToMany(() => Livro, (livro) => livro.autor)
  livros: Livro[];
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Autor } from '../autores/autor.entity.js';
import { Categoria } from '../categorias/categoria.entity.js';
import { Emprestimo } from '../emprestimos/emprestimo.entity.js';

@Entity('livros')
export class Livro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'int' })
  exemplares: number;

  @Column({ name: 'autor_id', type: 'int' })
  autorId: number;

  @Column({ name: 'categoria_id', type: 'int' })
  categoriaId: number;

  @ManyToOne(() => Autor, (autor) => autor.livros, { nullable: false })
  @JoinColumn({ name: 'autor_id' })
  autor: Relation<Autor>;

  @ManyToOne(() => Categoria, (categoria) => categoria.livros, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Relation<Categoria>;

  @OneToMany(() => Emprestimo, (emprestimo) => emprestimo.livro)
  emprestimos: Emprestimo[];
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Leitor } from '../leitores/leitor.entity.js';
import { Livro } from '../livros/livro.entity.js';

@Entity('emprestimos')
export class Emprestimo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'livro_id', type: 'int' })
  livroId: number;

  @Column({ name: 'leitor_id', type: 'int' })
  leitorId: number;

  @Column({ name: 'data_retirada', type: 'date' })
  dataRetirada: string;

  @Column({ name: 'data_prevista', type: 'date' })
  dataPrevista: string;

  @Column({ name: 'data_devolucao', type: 'date', nullable: true })
  dataDevolucao: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  multa: number;

  @ManyToOne(() => Livro, (livro) => livro.emprestimos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'livro_id' })
  livro: Relation<Livro>;

  @ManyToOne(() => Leitor, (leitor) => leitor.emprestimos, { nullable: false })
  @JoinColumn({ name: 'leitor_id' })
  leitor: Relation<Leitor>;
}

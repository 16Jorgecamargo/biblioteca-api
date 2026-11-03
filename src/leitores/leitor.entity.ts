import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Emprestimo } from '../emprestimos/emprestimo.entity.js';

@Entity('leitores')
export class Leitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  matricula: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @OneToMany(() => Emprestimo, (emprestimo) => emprestimo.leitor)
  emprestimos: Emprestimo[];
}

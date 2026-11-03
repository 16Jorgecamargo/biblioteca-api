import { IsIn, IsOptional } from 'class-validator';

export const EMPRESTIMO_STATUS = ['aberto', 'devolvido'] as const;

export type EmprestimoStatus = (typeof EMPRESTIMO_STATUS)[number];

export class ListEmprestimosQueryDto {
  @IsOptional()
  @IsIn(EMPRESTIMO_STATUS)
  status?: EmprestimoStatus;
}

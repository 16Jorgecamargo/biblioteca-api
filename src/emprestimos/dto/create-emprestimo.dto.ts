import { IsInt, Min } from 'class-validator';

export class CreateEmprestimoDto {
  @IsInt()
  @Min(1)
  livroId: number;

  @IsInt()
  @Min(1)
  leitorId: number;
}

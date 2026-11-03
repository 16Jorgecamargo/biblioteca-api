import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateLivroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsInt()
  @Min(1)
  exemplares: number;

  @IsInt()
  @Min(1)
  autorId: number;

  @IsInt()
  @Min(1)
  categoriaId: number;
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAutorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nome: string;
}

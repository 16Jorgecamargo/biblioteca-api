import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

const BOOLEAN_VALUES: Record<string, boolean> = { true: true, false: false };

export class ListLivrosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoria?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  autor?: number;

  @IsOptional()
  @Transform(({ value }) => BOOLEAN_VALUES[value] ?? value)
  @IsBoolean()
  disponivel?: boolean;
}

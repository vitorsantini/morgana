import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'Em progresso' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsString()
  @IsOptional()
  color?: string;
}

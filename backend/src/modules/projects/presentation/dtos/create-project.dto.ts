import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Morgana' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'rocket' })
  @IsString()
  @IsOptional()
  icon?: string;
}

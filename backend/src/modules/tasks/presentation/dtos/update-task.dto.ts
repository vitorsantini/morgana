import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Priority } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  columnId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  order?: number;
}

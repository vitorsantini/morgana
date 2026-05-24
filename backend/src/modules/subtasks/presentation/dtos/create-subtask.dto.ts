import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubtaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;
}

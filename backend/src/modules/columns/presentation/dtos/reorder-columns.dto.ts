import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderColumnsDto {
  @ApiProperty({ type: [String], description: 'Ordered array of column IDs' })
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}

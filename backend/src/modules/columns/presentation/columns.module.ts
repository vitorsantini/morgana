import { Module } from '@nestjs/common';
import { ColumnsController } from './columns.controller';
import { CreateColumnUseCase } from '../application/use-cases/create-column.use-case';
import { ToggleColumnVisibilityUseCase } from '../application/use-cases/toggle-column-visibility.use-case';
import { PrismaColumnRepository } from '../infrastructure/repositories/prisma-column.repository';
import { COLUMN_REPOSITORY } from '../domain/repositories/column.repository.interface';

@Module({
  controllers: [ColumnsController],
  providers: [
    CreateColumnUseCase,
    ToggleColumnVisibilityUseCase,
    {
      provide: COLUMN_REPOSITORY,
      useClass: PrismaColumnRepository,
    },
  ],
})
export class ColumnsModule {}

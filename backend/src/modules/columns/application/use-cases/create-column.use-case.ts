import { Inject, Injectable } from '@nestjs/common';
import {
  COLUMN_REPOSITORY,
  IColumnRepository,
} from '../../domain/repositories/column.repository.interface';
import { ColumnEntity } from '../../domain/entities/column.entity';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

interface CreateColumnInput {
  title: string;
  color?: string;
}

@Injectable()
export class CreateColumnUseCase {
  constructor(
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: IColumnRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateColumnInput): Promise<ColumnEntity> {
    const column = await this.columnRepository.create(input);

    // RN-01: add column to all existing projects automatically
    const projects = await this.prisma.project.findMany({ select: { id: true } });
    if (projects.length > 0) {
      await this.prisma.projectColumn.createMany({
        data: projects.map((p) => ({
          projectId: p.id,
          columnId: column.id,
          hidden: false,
        })),
      });
    }

    return column;
  }
}

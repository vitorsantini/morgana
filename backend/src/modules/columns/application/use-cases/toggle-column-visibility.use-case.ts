import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

interface ToggleVisibilityInput {
  projectId: string;
  columnId: string;
  hidden: boolean;
}

@Injectable()
export class ToggleColumnVisibilityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  // RN-02: project can hide a column — the column still exists globally
  async execute(input: ToggleVisibilityInput): Promise<void> {
    await this.prisma.projectColumn.updateMany({
      where: { projectId: input.projectId, columnId: input.columnId },
      data: { hidden: input.hidden },
    });
  }
}

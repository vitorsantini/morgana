import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

interface ToggleSubtaskInput {
  subtaskId: string;
  done: boolean;
  userId: string;
}

@Injectable()
export class ToggleSubtaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: ToggleSubtaskInput): Promise<{ autoAdvanced: boolean }> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: input.subtaskId },
      include: { task: { include: { project: true } } },
    });

    if (!subtask || subtask.task.project.userId !== input.userId) {
      throw new NotFoundException('Subtask not found');
    }

    await this.prisma.subtask.update({
      where: { id: input.subtaskId },
      data: { done: input.done },
    });

    // RN-08: auto-advance when all subtasks are done
    if (input.done) {
      return this.checkAutoAdvance(subtask.taskId, input.userId);
    }

    return { autoAdvanced: false };
  }

  private async checkAutoAdvance(
    taskId: string,
    userId: string,
  ): Promise<{ autoAdvanced: boolean }> {
    const settings = await this.prisma.userSettings.findFirst({
      where: { user: { id: userId } },
    });

    if (!settings?.autoAdvanceStatus) return { autoAdvanced: false };

    const subtasks = await this.prisma.subtask.findMany({ where: { taskId } });
    if (subtasks.length === 0 || subtasks.some((s) => !s.done)) {
      return { autoAdvanced: false };
    }

    const task = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: { columnId: true },
    });

    const nextColumn = await this.prisma.column.findFirst({
      where: { order: { gt: (await this.prisma.column.findUniqueOrThrow({ where: { id: task.columnId }, select: { order: true } })).order } },
      orderBy: { order: 'asc' },
    });

    if (!nextColumn) return { autoAdvanced: false };

    await this.prisma.task.update({
      where: { id: taskId },
      data: { columnId: nextColumn.id },
    });

    return { autoAdvanced: true };
  }
}

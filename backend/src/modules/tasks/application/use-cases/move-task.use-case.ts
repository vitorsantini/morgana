import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ITaskRepository,
  TASK_REPOSITORY,
} from '../../domain/repositories/task.repository.interface';
import { TaskEntity } from '../../domain/entities/task.entity';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

interface MoveTaskInput {
  taskId: string;
  userId: string;
  columnId: string;
  order?: number;
}

@Injectable()
export class MoveTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: MoveTaskInput): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(input.taskId, input.userId);
    if (!task) throw new NotFoundException('Task not found');

    const updated = await this.taskRepository.update(input.taskId, input.userId, {
      columnId: input.columnId,
      order: input.order,
    });

    // RN-08: auto-advance is checked when subtasks change — not on move
    return updated;
  }
}

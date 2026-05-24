import { Inject, Injectable } from '@nestjs/common';
import {
  ITaskRepository,
  TASK_REPOSITORY,
} from '../../domain/repositories/task.repository.interface';
import { TaskEntity } from '../../domain/entities/task.entity';
import { Priority } from '@prisma/client';

interface CreateTaskInput {
  userId: string;
  projectId: string;
  columnId: string;
  title: string;
  priority?: Priority;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskEntity> {
    return this.taskRepository.create(
      {
        projectId: input.projectId,
        columnId: input.columnId,
        title: input.title,
        priority: input.priority,
      },
      input.userId,
    );
  }
}

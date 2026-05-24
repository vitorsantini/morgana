import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreateTaskData,
  ITaskRepository,
  TaskWithSubtasks,
  UpdateTaskData,
} from '../../domain/repositories/task.repository.interface';
import { TaskEntity } from '../../domain/entities/task.entity';
import { Priority, Task } from '@prisma/client';

type TaskWithSubs = Task & { subtasks: { id: string; title: string; done: boolean }[] };

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId: string): Promise<TaskWithSubtasks | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { userId } },
      include: { subtasks: { select: { id: true, title: true, done: true } } },
    });
    return task ? this.toEntityWithSubs(task) : null;
  }

  async findByProject(projectId: string, userId: string): Promise<TaskWithSubtasks[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId, project: { userId } },
      include: { subtasks: { select: { id: true, title: true, done: true } } },
      orderBy: [{ columnId: 'asc' }, { order: 'asc' }],
    });
    return tasks.map(this.toEntityWithSubs);
  }

  async findAllForUser(userId: string): Promise<TaskWithSubtasks[]> {
    const tasks = await this.prisma.task.findMany({
      where: { project: { userId } },
      include: { subtasks: { select: { id: true, title: true, done: true } } },
      orderBy: [{ columnId: 'asc' }, { order: 'asc' }],
    });
    return tasks.map(this.toEntityWithSubs);
  }

  async create(data: CreateTaskData, userId: string): Promise<TaskEntity> {
    const maxOrder = await this.prisma.task.aggregate({
      where: { columnId: data.columnId, projectId: data.projectId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        projectId: data.projectId,
        columnId: data.columnId,
        priority: data.priority ?? Priority.MEDIUM,
        order: nextOrder,
      },
    });
    return this.toEntity(task);
  }

  async update(id: string, userId: string, data: UpdateTaskData): Promise<TaskEntity> {
    const task = await this.prisma.task.updateMany({
      where: { id, project: { userId } },
      data,
    });

    const updated = await this.prisma.task.findUniqueOrThrow({ where: { id } });
    return this.toEntity(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.task.deleteMany({ where: { id, project: { userId } } });
  }

  async reorderInColumn(columnId: string, orderedIds: string[], userId: string): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.task.updateMany({
          where: { id, columnId, project: { userId } },
          data: { order: index },
        }),
      ),
    );
  }

  private toEntity(task: Task): TaskEntity {
    return new TaskEntity({
      id: task.id,
      projectId: task.projectId,
      columnId: task.columnId,
      title: task.title,
      priority: task.priority,
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }

  private toEntityWithSubs(task: TaskWithSubs): TaskWithSubtasks {
    const entity = new TaskEntity({
      id: task.id,
      projectId: task.projectId,
      columnId: task.columnId,
      title: task.title,
      priority: task.priority,
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
    return Object.assign(entity, { subtasks: task.subtasks });
  }
}

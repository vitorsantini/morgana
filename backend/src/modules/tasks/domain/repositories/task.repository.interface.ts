import { Priority } from '@prisma/client';
import { TaskEntity } from '../entities/task.entity';

export interface CreateTaskData {
  projectId: string;
  columnId: string;
  title: string;
  priority?: Priority;
}

export interface UpdateTaskData {
  title?: string;
  priority?: Priority;
  columnId?: string;
  order?: number;
}

export interface TaskWithSubtasks extends TaskEntity {
  subtasks: { id: string; title: string; done: boolean }[];
}

export interface ITaskRepository {
  findById(id: string, userId: string): Promise<TaskWithSubtasks | null>;
  findByProject(projectId: string, userId: string): Promise<TaskWithSubtasks[]>;
  findAllForUser(userId: string): Promise<TaskWithSubtasks[]>;
  create(data: CreateTaskData, userId: string): Promise<TaskEntity>;
  update(id: string, userId: string, data: UpdateTaskData): Promise<TaskEntity>;
  delete(id: string, userId: string): Promise<void>;
  reorderInColumn(columnId: string, orderedIds: string[], userId: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { MoveTaskUseCase } from '../application/use-cases/move-task.use-case';
import { PrismaTaskRepository } from '../infrastructure/repositories/prisma-task.repository';
import { TASK_REPOSITORY } from '../domain/repositories/task.repository.interface';

@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    MoveTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}

import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { ToggleSubtaskUseCase } from '../application/use-cases/toggle-subtask.use-case';

@Module({
  controllers: [SubtasksController],
  providers: [ToggleSubtaskUseCase],
})
export class SubtasksModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { MoveTaskUseCase } from '../application/use-cases/move-task.use-case';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Inject } from '@nestjs/common';
import {
  ITaskRepository,
  TASK_REPOSITORY,
} from '../domain/repositories/task.repository.interface';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly moveTaskUseCase: MoveTaskUseCase,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  // RF-023: Painel Geral — tasks from all projects
  @ApiOperation({ summary: 'Get all tasks across all projects (General Panel)' })
  @Get('tasks')
  async listAll(@CurrentUser() user: JwtPayload) {
    const tasks = await this.taskRepository.findAllForUser(user.sub);
    return { data: tasks };
  }

  @ApiOperation({ summary: 'Get all tasks for a project' })
  @Get('projects/:projectId/tasks')
  async listByProject(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
  ) {
    const tasks = await this.taskRepository.findByProject(projectId, user.sub);
    return { data: tasks };
  }

  @ApiOperation({ summary: 'Get a single task with subtasks' })
  @Get('projects/:projectId/tasks/:id')
  async getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const task = await this.taskRepository.findById(id, user.sub);
    return { data: task };
  }

  @ApiOperation({ summary: 'Create a task in a project' })
  @Post('projects/:projectId/tasks')
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.createTaskUseCase.execute({
      userId: user.sub,
      projectId,
      ...dto,
    });
    return { data: task };
  }

  @ApiOperation({ summary: 'Update a task (title, priority, column, order)' })
  @Patch('projects/:projectId/tasks/:id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskRepository.update(id, user.sub, dto);
    return { data: task };
  }

  @ApiOperation({ summary: 'Move task to another column (drag-and-drop)' })
  @Patch('tasks/:id/move')
  async move(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('columnId') columnId: string,
    @Body('order') order?: number,
  ) {
    const task = await this.moveTaskUseCase.execute({
      taskId: id,
      userId: user.sub,
      columnId,
      order,
    });
    return { data: task };
  }

  @ApiOperation({ summary: 'Reorder tasks within a column' })
  @Patch('tasks/reorder')
  async reorder(
    @CurrentUser() user: JwtPayload,
    @Body('columnId') columnId: string,
    @Body('orderedIds') orderedIds: string[],
  ) {
    await this.taskRepository.reorderInColumn(columnId, orderedIds, user.sub);
    return { data: { success: true } };
  }

  @ApiOperation({ summary: 'Delete a task' })
  @Delete('projects/:projectId/tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.taskRepository.delete(id, user.sub);
  }
}

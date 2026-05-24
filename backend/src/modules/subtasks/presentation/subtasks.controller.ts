import {
  Body,
  Controller,
  Delete,
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
import { ToggleSubtaskUseCase } from '../application/use-cases/toggle-subtask.use-case';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@ApiTags('subtasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(
    private readonly toggleSubtaskUseCase: ToggleSubtaskUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Add subtask to a task' })
  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    const subtask = await this.prisma.subtask.create({
      data: { taskId, title: dto.title },
    });
    return { data: subtask };
  }

  @ApiOperation({ summary: 'Update subtask title' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    const subtask = await this.prisma.subtask.update({
      where: { id },
      data: { title },
    });
    return { data: subtask };
  }

  @ApiOperation({ summary: 'Toggle subtask completion (with auto-advance RN-08)' })
  @Patch(':id/toggle')
  async toggle(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('done') done: boolean,
  ) {
    const result = await this.toggleSubtaskUseCase.execute({
      subtaskId: id,
      done,
      userId: user.sub,
    });
    return { data: result };
  }

  @ApiOperation({ summary: 'Delete a subtask' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.prisma.subtask.delete({ where: { id } });
  }
}

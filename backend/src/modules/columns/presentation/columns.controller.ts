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
import { CreateColumnUseCase } from '../application/use-cases/create-column.use-case';
import { ToggleColumnVisibilityUseCase } from '../application/use-cases/toggle-column-visibility.use-case';
import { CreateColumnDto } from './dtos/create-column.dto';
import { ReorderColumnsDto } from './dtos/reorder-columns.dto';
import { Inject } from '@nestjs/common';
import {
  COLUMN_REPOSITORY,
  IColumnRepository,
} from '../domain/repositories/column.repository.interface';

@ApiTags('columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(
    private readonly createColumnUseCase: CreateColumnUseCase,
    private readonly toggleVisibilityUseCase: ToggleColumnVisibilityUseCase,
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: IColumnRepository,
  ) {}

  @ApiOperation({ summary: 'List all global columns' })
  @Get()
  async list() {
    const columns = await this.columnRepository.findAll();
    return { data: columns };
  }

  @ApiOperation({ summary: 'Create a global column (added to all projects)' })
  @Post()
  async create(@Body() dto: CreateColumnDto) {
    const column = await this.createColumnUseCase.execute(dto);
    return { data: column };
  }

  @ApiOperation({ summary: 'Update column title or color' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateColumnDto>) {
    const column = await this.columnRepository.update(id, dto);
    return { data: column };
  }

  @ApiOperation({ summary: 'Reorder columns globally (RN-04)' })
  @Patch('reorder')
  async reorder(@Body() dto: ReorderColumnsDto) {
    await this.columnRepository.reorder(dto.orderedIds);
    return { data: { success: true } };
  }

  @ApiOperation({ summary: 'Delete a column' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.columnRepository.delete(id);
  }

  @ApiOperation({ summary: 'Toggle column visibility for a project (RN-02)' })
  @Patch('projects/:projectId/columns/:columnId/visibility')
  async toggleVisibility(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body('hidden') hidden: boolean,
  ) {
    await this.toggleVisibilityUseCase.execute({ projectId, columnId, hidden });
    return { data: { success: true } };
  }
}

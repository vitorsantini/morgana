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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../application/use-cases/list-projects.use-case';
import { UpdateProjectUseCase } from '../application/use-cases/update-project.use-case';
import { ArchiveProjectUseCase } from '../application/use-cases/archive-project.use-case';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Inject } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../domain/repositories/project.repository.interface';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly archiveProjectUseCase: ArchiveProjectUseCase,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  @ApiOperation({ summary: 'List all projects' })
  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const projects = await this.listProjectsUseCase.execute(
      user.sub,
      includeArchived === 'true',
    );
    return { data: projects };
  }

  @ApiOperation({ summary: 'Create a project' })
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    const project = await this.createProjectUseCase.execute({
      userId: user.sub,
      ...dto,
    });
    return { data: project };
  }

  @ApiOperation({ summary: 'Update a project' })
  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.updateProjectUseCase.execute({
      id,
      userId: user.sub,
      ...dto,
    });
    return { data: project };
  }

  @ApiOperation({ summary: 'Archive or unarchive a project' })
  @Patch(':id/archive')
  async archive(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('archived') archived: boolean,
  ) {
    const project = await this.archiveProjectUseCase.execute({
      id,
      userId: user.sub,
      archived,
    });
    return { data: project };
  }

  @ApiOperation({ summary: 'Delete a project' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.projectRepository.delete(id, user.sub);
  }
}

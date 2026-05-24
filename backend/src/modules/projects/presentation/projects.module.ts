import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../application/use-cases/list-projects.use-case';
import { UpdateProjectUseCase } from '../application/use-cases/update-project.use-case';
import { ArchiveProjectUseCase } from '../application/use-cases/archive-project.use-case';
import { PrismaProjectRepository } from '../infrastructure/repositories/prisma-project.repository';
import { PROJECT_REPOSITORY } from '../domain/repositories/project.repository.interface';

@Module({
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    ListProjectsUseCase,
    UpdateProjectUseCase,
    ArchiveProjectUseCase,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
})
export class ProjectsModule {}

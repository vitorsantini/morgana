import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

interface CreateProjectInput {
  userId: string;
  name: string;
  color?: string;
  icon?: string;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectEntity> {
    const project = await this.projectRepository.create(input);

    // RN-01: link all existing global columns to the new project
    const columns = await this.prisma.column.findMany();
    if (columns.length > 0) {
      await this.prisma.projectColumn.createMany({
        data: columns.map((col) => ({
          projectId: project.id,
          columnId: col.id,
          hidden: false,
        })),
      });
    }

    return project;
  }
}

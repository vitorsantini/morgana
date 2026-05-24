import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';

interface ArchiveProjectInput {
  id: string;
  userId: string;
  archived: boolean;
}

@Injectable()
export class ArchiveProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: ArchiveProjectInput): Promise<ProjectEntity> {
    const existing = await this.projectRepository.findById(input.id, input.userId);
    if (!existing) throw new NotFoundException('Project not found');

    return this.projectRepository.update(input.id, input.userId, {
      archived: input.archived,
    });
  }
}

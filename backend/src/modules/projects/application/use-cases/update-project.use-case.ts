import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';

interface UpdateProjectInput {
  id: string;
  userId: string;
  name?: string;
  color?: string;
  icon?: string;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: UpdateProjectInput): Promise<ProjectEntity> {
    const existing = await this.projectRepository.findById(input.id, input.userId);
    if (!existing) throw new NotFoundException('Project not found');

    return this.projectRepository.update(input.id, input.userId, {
      name: input.name,
      color: input.color,
      icon: input.icon,
    });
  }
}

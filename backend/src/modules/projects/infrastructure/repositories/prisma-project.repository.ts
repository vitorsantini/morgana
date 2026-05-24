import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreateProjectData,
  IProjectRepository,
  UpdateProjectData,
} from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
import { Project } from '@prisma/client';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId: string): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.findFirst({ where: { id, userId } });
    return project ? this.toEntity(project) : null;
  }

  async findAllByUser(userId: string, includeArchived = false): Promise<ProjectEntity[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId, archived: includeArchived ? undefined : false },
      orderBy: { createdAt: 'asc' },
    });
    return projects.map(this.toEntity);
  }

  async create(data: CreateProjectData): Promise<ProjectEntity> {
    const project = await this.prisma.project.create({
      data: {
        userId: data.userId,
        name: data.name,
        color: data.color ?? null,
        icon: data.icon ?? null,
      },
    });
    return this.toEntity(project);
  }

  async update(id: string, userId: string, data: UpdateProjectData): Promise<ProjectEntity> {
    const project = await this.prisma.project.updateMany({
      where: { id, userId },
      data,
    });
    if (project.count === 0) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.findUniqueOrThrow({ where: { id } });
    return this.toEntity(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.project.deleteMany({ where: { id, userId } });
  }

  private toEntity(project: Project): ProjectEntity {
    return new ProjectEntity({
      id: project.id,
      userId: project.userId,
      name: project.name,
      color: project.color,
      icon: project.icon,
      archived: project.archived,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }
}

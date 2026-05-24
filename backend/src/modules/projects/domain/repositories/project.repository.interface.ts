import { ProjectEntity } from '../entities/project.entity';

export interface CreateProjectData {
  userId: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectData {
  name?: string;
  color?: string;
  icon?: string;
  archived?: boolean;
}

export interface IProjectRepository {
  findById(id: string, userId: string): Promise<ProjectEntity | null>;
  findAllByUser(userId: string, includeArchived?: boolean): Promise<ProjectEntity[]>;
  create(data: CreateProjectData): Promise<ProjectEntity>;
  update(id: string, userId: string, data: UpdateProjectData): Promise<ProjectEntity>;
  delete(id: string, userId: string): Promise<void>;
}

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

import { ColumnEntity } from '../entities/column.entity';

export interface CreateColumnData {
  title: string;
  color?: string;
}

export interface UpdateColumnData {
  title?: string;
  color?: string;
}

export interface IColumnRepository {
  findAll(): Promise<ColumnEntity[]>;
  findById(id: string): Promise<ColumnEntity | null>;
  create(data: CreateColumnData): Promise<ColumnEntity>;
  update(id: string, data: UpdateColumnData): Promise<ColumnEntity>;
  reorder(orderedIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}

export const COLUMN_REPOSITORY = 'COLUMN_REPOSITORY';

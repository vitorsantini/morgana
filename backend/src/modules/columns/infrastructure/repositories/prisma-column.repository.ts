import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreateColumnData,
  IColumnRepository,
  UpdateColumnData,
} from '../../domain/repositories/column.repository.interface';
import { ColumnEntity } from '../../domain/entities/column.entity';
import { Column } from '@prisma/client';

@Injectable()
export class PrismaColumnRepository implements IColumnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ColumnEntity[]> {
    const columns = await this.prisma.column.findMany({ orderBy: { order: 'asc' } });
    return columns.map(this.toEntity);
  }

  async findById(id: string): Promise<ColumnEntity | null> {
    const col = await this.prisma.column.findUnique({ where: { id } });
    return col ? this.toEntity(col) : null;
  }

  async create(data: CreateColumnData): Promise<ColumnEntity> {
    const maxOrder = await this.prisma.column.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const col = await this.prisma.column.create({
      data: {
        title: data.title,
        color: data.color ?? null,
        order: nextOrder,
      },
    });
    return this.toEntity(col);
  }

  async update(id: string, data: UpdateColumnData): Promise<ColumnEntity> {
    const col = await this.prisma.column.update({ where: { id }, data });
    return this.toEntity(col);
  }

  // RN-04: global reorder only
  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.column.update({ where: { id }, data: { order: index } }),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    const col = await this.prisma.column.findUnique({ where: { id } });
    if (!col) throw new NotFoundException('Column not found');
    await this.prisma.column.delete({ where: { id } });
  }

  private toEntity(col: Column): ColumnEntity {
    return new ColumnEntity({
      id: col.id,
      title: col.title,
      order: col.order,
      color: col.color,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
    });
  }
}

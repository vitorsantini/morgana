import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

const DEFAULT_COLUMNS = [
  { title: 'A Fazer', order: 0, color: '#6366f1' },
  { title: 'Em Andamento', order: 1, color: '#f59e0b' },
  { title: 'Concluído', order: 2, color: '#22c55e' },
];

@Injectable()
export class SeedColumnsService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.prisma.column.count();
    if (count > 0) return;

    await this.prisma.column.createMany({ data: DEFAULT_COLUMNS });
  }
}

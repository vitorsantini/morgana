import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Dashboard summary for today' })
  @Get()
  async summary(@CurrentUser() user: JwtPayload) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [habits, tasks, goals] = await Promise.all([
      this.prisma.habit.findMany({
        where: { userId: user.sub },
        include: {
          entries: {
            where: { date: { gte: today, lt: tomorrow } },
          },
        },
      }),
      this.prisma.task.findMany({
        where: {
          project: { userId: user.sub },
          column: { title: { in: ['Em progresso', 'In Progress', 'Doing'] } },
        },
        include: { subtasks: { select: { done: true } } },
        take: 10,
      }),
      this.prisma.goal.findMany({
        where: { userId: user.sub },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      data: {
        habits: {
          total: habits.length,
          completedToday: habits.filter((h) => h.entries.length > 0).length,
          pending: habits.filter((h) => h.entries.length === 0),
        },
        tasksInProgress: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          subtaskProgress: {
            done: t.subtasks.filter((s) => s.done).length,
            total: t.subtasks.length,
          },
        })),
        goals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          currentValue: g.currentValue,
          targetValue: g.targetValue,
          unit: g.unit,
          percentage: Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)),
        })),
      },
    };
  }
}

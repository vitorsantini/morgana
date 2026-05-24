import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateHabitDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;
}

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all habits with streak info' })
  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    const habits = await this.prisma.habit.findMany({
      where: { userId: user.sub },
      include: { entries: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'asc' },
    });
    return {
      data: habits.map((h) => ({
        ...h,
        streak: this.calculateStreak(h.entries.map((e) => e.date)),
      })),
    };
  }

  @ApiOperation({ summary: 'Create a habit' })
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateHabitDto) {
    const habit = await this.prisma.habit.create({
      data: { userId: user.sub, name: dto.name },
    });
    return { data: habit };
  }

  @ApiOperation({ summary: 'Log habit completion for a date' })
  @Post(':id/entries')
  async logEntry(
    @CurrentUser() user: JwtPayload,
    @Param('id') habitId: string,
    @Body('date') dateStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);

    const entry = await this.prisma.habitEntry.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habitId, date },
      update: {},
    });
    return { data: entry };
  }

  @ApiOperation({ summary: 'Remove habit entry for a date' })
  @Delete(':id/entries/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEntry(@Param('id') habitId: string, @Param('date') dateStr: string) {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);
    await this.prisma.habitEntry.deleteMany({ where: { habitId, date } });
  }

  @ApiOperation({ summary: 'Get heatmap data for a habit (year)' })
  @Get(':id/heatmap')
  async heatmap(
    @CurrentUser() user: JwtPayload,
    @Param('id') habitId: string,
    @Query('year') year?: string,
  ) {
    const y = parseInt(year ?? String(new Date().getFullYear()), 10);
    const entries = await this.prisma.habitEntry.findMany({
      where: {
        habitId,
        habit: { userId: user.sub },
        date: {
          gte: new Date(`${y}-01-01`),
          lte: new Date(`${y}-12-31`),
        },
      },
      select: { date: true },
    });
    return { data: entries.map((e) => e.date) };
  }

  @ApiOperation({ summary: 'Delete a habit' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.prisma.habit.deleteMany({ where: { id, userId: user.sub } });
  }

  private calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let streak = 0;
    let current = new Date(today);

    for (const date of sorted) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);

      if (d.getTime() === current.getTime()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else if (d.getTime() < current.getTime()) {
        break;
      }
    }

    return streak;
  }
}

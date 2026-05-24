import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

class CreateGoalDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  targetValue: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;
}

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List all goals' })
  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    const goals = await this.prisma.goal.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    });
    return { data: goals };
  }

  @ApiOperation({ summary: 'Create a goal' })
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId: user.sub,
        title: dto.title,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue ?? 0,
        unit: dto.unit ?? null,
      },
    });
    return { data: goal };
  }

  @ApiOperation({ summary: 'Update goal progress or details' })
  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateGoalDto>,
  ) {
    await this.prisma.goal.updateMany({ where: { id, userId: user.sub }, data: dto });
    const goal = await this.prisma.goal.findUniqueOrThrow({ where: { id } });
    return { data: goal };
  }

  @ApiOperation({ summary: 'Delete a goal' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.prisma.goal.deleteMany({ where: { id, userId: user.sub } });
  }
}

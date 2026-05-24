import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ViewType } from '@prisma/client';
import { JwtAuthGuard } from '../../../shared/presentation/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  autoAdvanceStatus?: boolean;
}

class SetViewPreferenceDto {
  @ApiPropertyOptional({ description: 'null = General Panel' })
  @IsString()
  @IsOptional()
  projectId?: string | null;

  @ApiPropertyOptional({ enum: ViewType })
  @IsEnum(ViewType)
  view: ViewType;
}

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get user settings' })
  @Get()
  async get(@CurrentUser() user: JwtPayload) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId: user.sub },
      create: { userId: user.sub },
      update: {},
    });
    return { data: settings };
  }

  @ApiOperation({ summary: 'Update user settings' })
  @Patch()
  async update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSettingsDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId: user.sub },
      create: { userId: user.sub, ...dto },
      update: dto,
    });
    return { data: settings };
  }

  @ApiOperation({ summary: 'Set view preference for a project or General Panel (RN-09)' })
  @Patch('view-preference')
  async setViewPreference(@CurrentUser() user: JwtPayload, @Body() dto: SetViewPreferenceDto) {
    const pref = await this.prisma.viewPreference.upsert({
      where: {
        userId_projectId: {
          userId: user.sub,
          projectId: dto.projectId ?? (null as unknown as string),
        },
      },
      create: {
        userId: user.sub,
        projectId: dto.projectId ?? null,
        view: dto.view,
      },
      update: { view: dto.view },
    });
    return { data: pref };
  }

  @ApiOperation({ summary: 'Get all view preferences' })
  @Get('view-preferences')
  async getViewPreferences(@CurrentUser() user: JwtPayload) {
    const prefs = await this.prisma.viewPreference.findMany({
      where: { userId: user.sub },
    });
    return { data: prefs };
  }
}

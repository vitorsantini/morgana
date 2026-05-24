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
import { CreateNoteDto } from './dtos/create-note.dto';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List notes (filter by folder, tag, template)' })
  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('folder') folder?: string,
    @Query('tag') tag?: string,
    @Query('template') template?: string,
    @Query('search') search?: string,
  ) {
    const notes = await this.prisma.note.findMany({
      where: {
        userId: user.sub,
        ...(folder ? { folder } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(template !== undefined ? { isTemplate: template === 'true' } : {}),
        // RF-062: full-text search
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, folder: true, tags: true, isTemplate: true, updatedAt: true },
    });
    return { data: notes };
  }

  @ApiOperation({ summary: 'Get a single note with full content' })
  @Get(':id')
  async getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const note = await this.prisma.note.findFirst({ where: { id, userId: user.sub } });
    return { data: note };
  }

  @ApiOperation({ summary: 'Create a note' })
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        userId: user.sub,
        title: dto.title,
        content: dto.content ?? '',
        folder: dto.folder ?? null,
        tags: dto.tags ?? [],
        isTemplate: dto.isTemplate ?? false,
      },
    });
    return { data: note };
  }

  @ApiOperation({ summary: 'Update a note' })
  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateNoteDto>,
  ) {
    await this.prisma.note.updateMany({ where: { id, userId: user.sub }, data: dto });
    const note = await this.prisma.note.findUniqueOrThrow({ where: { id } });
    return { data: note };
  }

  @ApiOperation({ summary: 'Delete a note' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.prisma.note.deleteMany({ where: { id, userId: user.sub } });
  }

  @ApiOperation({ summary: 'List unique folders' })
  @Get('meta/folders')
  async folders(@CurrentUser() user: JwtPayload) {
    const notes = await this.prisma.note.findMany({
      where: { userId: user.sub, folder: { not: null } },
      select: { folder: true },
      distinct: ['folder'],
    });
    return { data: notes.map((n) => n.folder) };
  }

  @ApiOperation({ summary: 'List unique tags' })
  @Get('meta/tags')
  async tags(@CurrentUser() user: JwtPayload) {
    const notes = await this.prisma.note.findMany({
      where: { userId: user.sub },
      select: { tags: true },
    });
    const allTags = [...new Set(notes.flatMap((n) => n.tags))];
    return { data: allTags };
  }
}

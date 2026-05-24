import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { ProjectsModule } from './modules/projects/presentation/projects.module';
import { ColumnsModule } from './modules/columns/presentation/columns.module';
import { TasksModule } from './modules/tasks/presentation/tasks.module';
import { SubtasksModule } from './modules/subtasks/presentation/subtasks.module';
import { NotesModule } from './modules/notes/presentation/notes.module';
import { HabitsModule } from './modules/habits/presentation/habits.module';
import { GoalsModule } from './modules/goals/presentation/goals.module';
import { DashboardModule } from './modules/dashboard/presentation/dashboard.module';
import { SettingsModule } from './modules/settings/presentation/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    ColumnsModule,
    TasksModule,
    SubtasksModule,
    NotesModule,
    HabitsModule,
    GoalsModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule {}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardData {
  habits: {
    total: number;
    completedToday: number;
    pending: { id: string; name: string }[];
  };
  tasksInProgress: {
    id: string;
    title: string;
    subtaskProgress: { done: number; total: number };
  }[];
  goals: {
    id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string | null;
    percentage: number;
  }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ today() }}</p>
        </div>
      </div>

      @if (data()) {
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Habits card -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-800 dark:text-gray-200">Hábitos hoje</h2>
              <a routerLink="/habits" class="text-xs text-primary-600 hover:underline">Ver todos</a>
            </div>
            <div class="flex items-end gap-2 mb-3">
              <span class="text-3xl font-bold text-primary-600">{{ data()!.habits.completedToday }}</span>
              <span class="text-gray-400 mb-1">/ {{ data()!.habits.total }}</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all"
                [style.width]="habitsPercent() + '%'"
              ></div>
            </div>
            @if (data()!.habits.pending.length > 0) {
              <div class="mt-3 space-y-1">
                @for (h of data()!.habits.pending.slice(0, 3); track h.id) {
                  <p class="text-xs text-gray-500 dark:text-gray-400">• {{ h.name }}</p>
                }
              </div>
            }
          </div>

          <!-- Tasks in progress -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-800 dark:text-gray-200">Em progresso</h2>
            </div>
            @if (data()!.tasksInProgress.length === 0) {
              <p class="text-sm text-gray-400">Nenhuma tarefa em progresso</p>
            }
            <div class="space-y-3">
              @for (task of data()!.tasksInProgress.slice(0, 4); track task.id) {
                <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mb-1 truncate">{{ task.title }}</p>
                  @if (task.subtaskProgress.total > 0) {
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary-400 rounded-full"
                          [style.width]="(task.subtaskProgress.done / task.subtaskProgress.total * 100) + '%'"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-400">{{ task.subtaskProgress.done }}/{{ task.subtaskProgress.total }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Goals -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-800 dark:text-gray-200">Metas</h2>
              <a routerLink="/goals" class="text-xs text-primary-600 hover:underline">Ver todas</a>
            </div>
            <div class="space-y-3">
              @for (goal of data()!.goals.slice(0, 3); track goal.id) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ goal.title }}</span>
                    <span class="text-primary-600 font-medium ml-2 shrink-0">{{ goal.percentage }}%</span>
                  </div>
                  <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 rounded-full"
                      [style.width]="goal.percentage + '%'"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center text-gray-400 mt-12">Carregando...</div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly data = signal<DashboardData | null>(null);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<{ data: DashboardData }>(`${environment.apiUrl}/dashboard`)
      .subscribe((res) => this.data.set(res.data));
  }

  today(): string {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  habitsPercent(): number {
    const d = this.data();
    if (!d || d.habits.total === 0) return 0;
    return Math.round((d.habits.completedToday / d.habits.total) * 100);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService, Habit } from '../../core/services/habits.service';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-xl font-semibold">Hábitos</h1>
        <button (click)="showForm.set(true)" class="btn-primary">+ Novo hábito</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        @if (showForm()) {
          <div class="card p-4 mb-4">
            <form (ngSubmit)="createHabit()" class="flex gap-3">
              <input
                [(ngModel)]="newHabitName"
                name="name"
                class="input flex-1"
                placeholder="Nome do hábito..."
                autofocus
              />
              <button type="submit" class="btn-primary">Criar</button>
              <button type="button" (click)="showForm.set(false)" class="btn-secondary">Cancelar</button>
            </form>
          </div>
        }

        <div class="space-y-4">
          @for (habit of habitsService.habits(); track habit.id) {
            <div class="card p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ habit.name }}</h3>
                  <!-- Streak -->
                  <div class="flex items-center gap-1 text-amber-500">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <span class="text-sm font-semibold">{{ habit.streak }} dias</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    (click)="logToday(habit)"
                    [class.btn-primary]="!isDoneToday(habit)"
                    [class.btn-secondary]="isDoneToday(habit)"
                    class="text-sm"
                  >
                    {{ isDoneToday(habit) ? 'Feito hoje!' : 'Marcar hoje' }}
                  </button>
                  <button
                    (click)="selectedHabit.set(habit.id)"
                    class="btn-ghost text-sm"
                  >
                    Heatmap
                  </button>
                  <button (click)="deleteHabit(habit.id)" class="btn-ghost text-red-500 text-sm">Excluir</button>
                </div>
              </div>

              <!-- Mini week view -->
              <div class="flex gap-1">
                @for (day of lastSevenDays(); track day.date) {
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="w-7 h-7 rounded-md transition-colors"
                      [class.bg-primary-500]="isDoneOnDate(habit, day.date)"
                      [class.bg-gray-100]="!isDoneOnDate(habit, day.date)"
                      [class.dark:bg-primary-600]="isDoneOnDate(habit, day.date)"
                      [class.dark:bg-gray-800]="!isDoneOnDate(habit, day.date)"
                      [title]="day.label"
                    ></div>
                    <span class="text-xs text-gray-400">{{ day.dayLetter }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HabitsComponent implements OnInit {
  readonly showForm = signal(false);
  readonly selectedHabit = signal<string | null>(null);
  newHabitName = '';

  constructor(readonly habitsService: HabitsService) {}

  ngOnInit(): void {
    this.habitsService.loadAll().subscribe();
  }

  createHabit(): void {
    if (!this.newHabitName.trim()) return;
    this.habitsService.create(this.newHabitName).subscribe(() => {
      this.newHabitName = '';
      this.showForm.set(false);
    });
  }

  logToday(habit: Habit): void {
    if (this.isDoneToday(habit)) return;
    this.habitsService.logEntry(habit.id).subscribe(() => {
      this.habitsService.loadAll().subscribe();
    });
  }

  isDoneToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.entries.some((e) => e.date.startsWith(today));
  }

  isDoneOnDate(habit: Habit, date: string): boolean {
    return habit.entries.some((e) => e.date.startsWith(date));
  }

  deleteHabit(id: string): void {
    this.habitsService.delete(id).subscribe();
  }

  lastSevenDays(): { date: string; label: string; dayLetter: string }[] {
    const days = [];
    const letters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('pt-BR'),
        dayLetter: letters[d.getDay()],
      });
    }
    return days;
  }
}

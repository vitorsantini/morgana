import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Goal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string | null;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 class="text-xl font-semibold">Metas</h1>
        <button (click)="showForm.set(!showForm())" class="btn-primary">+ Nova meta</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        @if (showForm()) {
          <div class="card p-4 mb-6">
            <h3 class="font-medium mb-3">Nova meta</h3>
            <form (ngSubmit)="createGoal()" class="space-y-3">
              <input [(ngModel)]="form.title" name="title" class="input" placeholder="Título da meta..." required />
              <div class="flex gap-3">
                <input [(ngModel)]="form.targetValue" name="target" type="number" class="input" placeholder="Valor alvo" required />
                <input [(ngModel)]="form.unit" name="unit" class="input" placeholder="Unidade (ex: livros)" />
              </div>
              <div class="flex gap-2">
                <button type="submit" class="btn-primary">Criar</button>
                <button type="button" (click)="showForm.set(false)" class="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        }

        <div class="grid gap-4 sm:grid-cols-2">
          @for (goal of goals(); track goal.id) {
            <div class="card p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ goal.title }}</h3>
                <button (click)="deleteGoal(goal.id)" class="text-gray-300 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Progress -->
              <div class="mb-3">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ goal.currentValue }}{{ goal.unit ? ' ' + goal.unit : '' }}
                  </span>
                  <span class="font-semibold text-primary-600">
                    {{ percent(goal) }}%
                  </span>
                </div>
                <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500 rounded-full transition-all"
                    [style.width]="percent(goal) + '%'"
                  ></div>
                </div>
                <p class="text-xs text-gray-400 mt-1">Meta: {{ goal.targetValue }}{{ goal.unit ? ' ' + goal.unit : '' }}</p>
              </div>

              <!-- Update progress -->
              <div class="flex gap-2">
                <input
                  type="number"
                  [placeholder]="'Atual: ' + goal.currentValue"
                  #progressInput
                  class="input text-sm flex-1"
                />
                <button
                  (click)="updateProgress(goal, +progressInput.value); progressInput.value = ''"
                  class="btn-secondary text-sm"
                >
                  Atualizar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class GoalsComponent implements OnInit {
  readonly goals = signal<Goal[]>([]);
  readonly showForm = signal(false);
  form = { title: '', targetValue: 0, unit: '' };

  private readonly url = `${environment.apiUrl}/goals`;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.http.get<{ data: Goal[] }>(this.url).subscribe((res) => this.goals.set(res.data));
  }

  createGoal(): void {
    this.http.post<{ data: Goal }>(this.url, this.form).subscribe((res) => {
      this.goals.update((g) => [res.data, ...g]);
      this.form = { title: '', targetValue: 0, unit: '' };
      this.showForm.set(false);
    });
  }

  updateProgress(goal: Goal, value: number): void {
    if (isNaN(value)) return;
    this.http
      .patch<{ data: Goal }>(`${this.url}/${goal.id}`, { currentValue: value })
      .subscribe((res) =>
        this.goals.update((g) => g.map((x) => (x.id === goal.id ? res.data : x))),
      );
  }

  deleteGoal(id: string): void {
    this.http.delete(`${this.url}/${id}`).subscribe(() =>
      this.goals.update((g) => g.filter((x) => x.id !== id)),
    );
  }

  percent(goal: Goal): number {
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  }
}

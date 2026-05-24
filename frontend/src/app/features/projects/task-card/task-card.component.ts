import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/services/tasks.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card p-3 cursor-pointer hover:shadow-md transition-shadow group"
    >
      <!-- Priority badge -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
          {{ task().title }}
        </span>
        <span [class]="priorityClass()">{{ priorityLabel() }}</span>
      </div>

      <!-- RF-042: subtask progress counter -->
      @if (task().subtasks.length > 0) {
        <div class="flex items-center gap-1.5 mt-2">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ doneCount() }}/{{ task().subtasks.length }}
          </span>
          <!-- Progress bar -->
          <div class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all"
              [style.width]="progressPercent() + '%'"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();

  doneCount(): number {
    return this.task().subtasks.filter((s) => s.done).length;
  }

  progressPercent(): number {
    const total = this.task().subtasks.length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  }

  priorityLabel(): string {
    const map: Record<string, string> = { HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' };
    return map[this.task().priority] ?? '';
  }

  priorityClass(): string {
    const map: Record<string, string> = {
      HIGH: 'badge-high',
      MEDIUM: 'badge-medium',
      LOW: 'badge-low',
    };
    return map[this.task().priority] ?? 'badge';
  }
}

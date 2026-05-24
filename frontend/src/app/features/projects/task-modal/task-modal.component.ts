import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TasksService } from '../../../core/services/tasks.service';
import { Column } from '../../../core/services/columns.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" (click)="close.emit()">
      <div class="card w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            @if (editing()) {
              <input [(ngModel)]="editTitle" class="input flex-1 text-lg font-semibold" />
            } @else {
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 cursor-pointer hover:text-primary-600"
                (dblclick)="startEdit()"
              >
                {{ task().title }}
              </h2>
            }
            <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Meta -->
          <div class="flex items-center gap-3 mb-6 flex-wrap">
            <!-- Priority -->
            <select
              [ngModel]="task().priority"
              (ngModelChange)="updatePriority($event)"
              class="input w-auto text-xs"
            >
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Média</option>
              <option value="LOW">Baixa</option>
            </select>

            <!-- Column -->
            <select
              [ngModel]="task().columnId"
              (ngModelChange)="moveToColumn($event)"
              class="input w-auto text-xs"
            >
              @for (col of columns(); track col.id) {
                <option [value]="col.id">{{ col.title }}</option>
              }
            </select>

            @if (editing()) {
              <button (click)="saveEdit()" class="btn-primary text-xs">Salvar</button>
              <button (click)="editing.set(false)" class="btn-secondary text-xs">Cancelar</button>
            }
          </div>

          <!-- Subtasks -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Subtarefas
                @if (task().subtasks.length > 0) {
                  <span class="font-normal text-gray-400 ml-1">
                    {{ doneCount() }}/{{ task().subtasks.length }}
                  </span>
                }
              </h3>
            </div>

            <!-- Progress bar -->
            @if (task().subtasks.length > 0) {
              <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all"
                  [style.width]="progressPercent() + '%'"
                ></div>
              </div>
            }

            <div class="space-y-2 mb-3">
              @for (sub of task().subtasks; track sub.id) {
                <div class="flex items-center gap-3 group">
                  <input
                    type="checkbox"
                    [checked]="sub.done"
                    (change)="toggleSubtask(sub.id, !sub.done)"
                    class="rounded border-gray-300 text-primary-600"
                  />
                  <span
                    class="flex-1 text-sm"
                    [class.line-through]="sub.done"
                    [class.text-gray-400]="sub.done"
                    [class.text-gray-700]="!sub.done"
                  >
                    {{ sub.title }}
                  </span>
                  <button
                    (click)="deleteSubtask(sub.id)"
                    class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Add subtask -->
            <form (ngSubmit)="addSubtask()" class="flex gap-2">
              <input
                [(ngModel)]="newSubtaskTitle"
                name="subtask"
                class="input flex-1 text-sm"
                placeholder="Adicionar subtarefa..."
              />
              <button type="submit" class="btn-secondary text-sm">+</button>
            </form>
          </div>

          <!-- Delete task -->
          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button (click)="deleteTask()" class="text-sm text-red-500 hover:text-red-700 transition-colors">
              Excluir tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaskModalComponent {
  readonly task = input.required<Task>();
  readonly columns = input<Column[]>([]);
  readonly projectId = input<string>('');
  readonly close = output<void>();
  readonly taskUpdated = output<Task>();

  readonly editing = signal(false);
  editTitle = '';
  newSubtaskTitle = '';

  constructor(private readonly tasksService: TasksService) {}

  doneCount(): number {
    return this.task().subtasks.filter((s) => s.done).length;
  }

  progressPercent(): number {
    const total = this.task().subtasks.length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  }

  startEdit(): void {
    this.editTitle = this.task().title;
    this.editing.set(true);
  }

  saveEdit(): void {
    this.tasksService.update(this.projectId(), this.task().id, { title: this.editTitle }).subscribe({
      next: (res) => {
        this.taskUpdated.emit(res.data);
        this.editing.set(false);
      },
    });
  }

  updatePriority(priority: string): void {
    this.tasksService.update(this.projectId(), this.task().id, { priority: priority as Task['priority'] }).subscribe({
      next: (res) => this.taskUpdated.emit(res.data),
    });
  }

  moveToColumn(columnId: string): void {
    this.tasksService.move(this.task().id, columnId).subscribe({
      next: (res) => this.taskUpdated.emit(res.data),
    });
  }

  addSubtask(): void {
    if (!this.newSubtaskTitle.trim()) return;
    this.tasksService.addSubtask(this.task().id, this.newSubtaskTitle).subscribe();
    this.newSubtaskTitle = '';
  }

  toggleSubtask(subtaskId: string, done: boolean): void {
    this.tasksService.toggleSubtask(this.task().id, subtaskId, done).subscribe();
  }

  deleteSubtask(subtaskId: string): void {
    this.tasksService.deleteSubtask(this.task().id, subtaskId).subscribe();
  }

  deleteTask(): void {
    this.tasksService.delete(this.projectId(), this.task().id).subscribe({
      next: () => this.close.emit(),
    });
  }
}

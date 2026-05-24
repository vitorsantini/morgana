import {
  Component,
  OnInit,
  computed,
  signal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TasksService, Task } from '../../../core/services/tasks.service';
import { ColumnsService, Column } from '../../../core/services/columns.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';

type ViewType = 'KANBAN' | 'LIST';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskCardComponent, TaskModalComponent],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          @if (currentProject()) {
            <span
              class="w-3 h-3 rounded-full"
              [style.background-color]="currentProject()!.color ?? '#6366f1'"
            ></span>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ currentProject()!.name }}
            </h1>
          } @else {
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Painel Geral</h1>
          }
        </div>

        <div class="flex items-center gap-2">
          <!-- View toggle -->
          <div class="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button
              (click)="view.set('KANBAN')"
              [class.bg-primary-50]="view() === 'KANBAN'"
              [class.dark:bg-primary-900/20]="view() === 'KANBAN'"
              [class.text-primary-700]="view() === 'KANBAN'"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors"
              title="Kanban"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            </button>
            <button
              (click)="view.set('LIST')"
              [class.bg-primary-50]="view() === 'LIST'"
              [class.dark:bg-primary-900/20]="view() === 'LIST'"
              [class.text-primary-700]="view() === 'LIST'"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-800 transition-colors"
              title="Lista"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
          </div>

          <button (click)="openNewTask()" class="btn-primary">
            + Nova tarefa
          </button>
        </div>
      </div>

      <!-- Kanban View -->
      @if (view() === 'KANBAN') {
        <div class="flex-1 overflow-x-auto">
          <div class="flex gap-4 p-6 h-full min-w-max">
            @for (col of visibleColumns(); track col.id) {
              <div class="w-72 flex flex-col">
                <!-- Column header -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    @if (col.color) {
                      <span class="w-2 h-2 rounded-full" [style.background-color]="col.color"></span>
                    }
                    <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ col.title }}</span>
                    <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                      {{ tasksForColumn(col.id).length }}
                    </span>
                  </div>
                  <button
                    (click)="openNewTask(col.id)"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Adicionar tarefa"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>

                <!-- Task list with CDK DnD -->
                <div
                  cdkDropList
                  [id]="col.id"
                  [cdkDropListData]="tasksForColumn(col.id)"
                  [cdkDropListConnectedTo]="columnIds()"
                  (cdkDropListDropped)="onTaskDrop($event)"
                  class="flex-1 space-y-2 min-h-20 rounded-xl p-1"
                >
                  @for (task of tasksForColumn(col.id); track task.id) {
                    <div cdkDrag>
                      <app-task-card [task]="task" (click)="openTask(task)" />
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- List View -->
      @if (view() === 'LIST') {
        <div class="flex-1 overflow-y-auto p-6">
          @for (col of visibleColumns(); track col.id) {
            @if (tasksForColumn(col.id).length > 0) {
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-2">
                  @if (col.color) {
                    <span class="w-2 h-2 rounded-full" [style.background-color]="col.color"></span>
                  }
                  <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ col.title }}</h3>
                  <span class="text-xs text-gray-400">{{ tasksForColumn(col.id).length }}</span>
                </div>
                @for (task of tasksForColumn(col.id); track task.id) {
                  <div class="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div
                      class="flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer"
                      (click)="openTask(task)"
                    >
                      <span class="w-1.5 flex-shrink-0" [class]="priorityDot(task.priority)"></span>
                      <span class="flex-1 text-sm text-gray-800 dark:text-gray-200">{{ task.title }}</span>
                      @if (task.subtasks.length > 0) {
                        <span class="text-xs text-gray-400">
                          {{ task.subtasks.filter(s => s.done).length }}/{{ task.subtasks.length }}
                        </span>
                      }
                    </div>
                    <!-- RF-043: subtasks nested in list view -->
                    @for (sub of task.subtasks; track sub.id) {
                      <div class="flex items-center gap-3 pl-8 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          [checked]="sub.done"
                          (change)="toggleSubtask(task, sub.id, !sub.done)"
                          class="rounded border-gray-300"
                          (click)="$event.stopPropagation()"
                        />
                        <span [class.line-through]="sub.done" [class.text-gray-400]="sub.done">
                          {{ sub.title }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>

    <!-- Task Modal -->
    @if (selectedTask()) {
      <app-task-modal
        [task]="selectedTask()!"
        [columns]="visibleColumns()"
        [projectId]="id()"
        (close)="selectedTask.set(null)"
        (taskUpdated)="onTaskUpdated($event)"
      />
    }

    <!-- New task quick modal -->
    @if (showNewTaskForm()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="showNewTaskForm.set(false)">
        <div class="card p-6 w-96" (click)="$event.stopPropagation()">
          <h3 class="font-semibold mb-4">Nova tarefa</h3>
          <form (ngSubmit)="createTask()">
            <input
              [(ngModel)]="newTaskTitle"
              name="title"
              class="input mb-3"
              placeholder="Título da tarefa..."
              autofocus
            />
            <div class="flex gap-2">
              <select [(ngModel)]="newTaskColumnId" name="columnId" class="input flex-1">
                @for (col of visibleColumns(); track col.id) {
                  <option [value]="col.id">{{ col.title }}</option>
                }
              </select>
              <button type="submit" class="btn-primary">Criar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BoardComponent implements OnInit {
  readonly id = input.required<string>();

  readonly view = signal<ViewType>('KANBAN');
  readonly selectedTask = signal<Task | null>(null);
  readonly showNewTaskForm = signal(false);
  newTaskTitle = '';
  newTaskColumnId = '';

  readonly currentProject = computed(() =>
    this.projectsService.projects().find((p) => p.id === this.id()),
  );

  readonly visibleColumns = computed(() => {
    const cols = this.columnsService.columns();
    return cols; // TODO: filter hidden columns per project (RN-02)
  });

  readonly columnIds = computed(() => this.visibleColumns().map((c) => c.id));

  constructor(
    private readonly tasksService: TasksService,
    private readonly columnsService: ColumnsService,
    private readonly projectsService: ProjectsService,
  ) {}

  ngOnInit(): void {
    if (this.id()) {
      this.tasksService.loadByProject(this.id()).subscribe();
    } else {
      this.tasksService.loadAll().subscribe();
    }

    if (this.visibleColumns().length > 0) {
      this.newTaskColumnId = this.visibleColumns()[0].id;
    }
  }

  tasksForColumn(columnId: string): Task[] {
    return this.tasksService.tasks()
      .filter((t) => t.columnId === columnId && (this.id() ? t.projectId === this.id() : true))
      .sort((a, b) => a.order - b.order);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      const orderedIds = [...event.container.data].map((t) => t.id);
      moveItemInArray(orderedIds, event.previousIndex, event.currentIndex);
      this.tasksService.reorder(event.container.id, orderedIds).subscribe();
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.tasksService.move(task.id, event.container.id, event.currentIndex).subscribe();
    }
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  openNewTask(columnId?: string): void {
    this.newTaskColumnId = columnId ?? this.visibleColumns()[0]?.id ?? '';
    this.showNewTaskForm.set(true);
  }

  createTask(): void {
    if (!this.newTaskTitle.trim() || !this.newTaskColumnId) return;

    this.tasksService
      .create(this.id(), { title: this.newTaskTitle, columnId: this.newTaskColumnId })
      .subscribe();

    this.newTaskTitle = '';
    this.showNewTaskForm.set(false);
  }

  onTaskUpdated(task: Task): void {
    this.selectedTask.set(task);
  }

  toggleSubtask(task: Task, subtaskId: string, done: boolean): void {
    this.tasksService.toggleSubtask(task.id, subtaskId, done).subscribe();
  }

  priorityDot(priority: string): string {
    const map: Record<string, string> = {
      HIGH: 'h-full bg-red-500 rounded-full',
      MEDIUM: 'h-full bg-amber-400 rounded-full',
      LOW: 'h-full bg-green-500 rounded-full',
    };
    return map[priority] ?? '';
  }
}

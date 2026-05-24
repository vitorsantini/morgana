import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ColumnsService } from '../../core/services/columns.service';

interface UserSettings {
  autoAdvanceStatus: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Configurações</h1>

      <div class="space-y-6">
        <!-- Task settings -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">Tarefas</h2>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-avanço de status</p>
              <p class="text-xs text-gray-400 mt-0.5">Mover tarefa automaticamente para a próxima coluna quando todas as subtarefas forem concluídas</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input
                type="checkbox"
                [checked]="settings()?.autoAdvanceStatus"
                (change)="updateAutoAdvance($event)"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <!-- Columns management -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-800 dark:text-gray-200">Colunas globais</h2>
            <button (click)="showColumnForm.set(true)" class="btn-primary text-sm">+ Adicionar</button>
          </div>

          @if (showColumnForm()) {
            <form (ngSubmit)="createColumn()" class="flex gap-2 mb-4">
              <input [(ngModel)]="newColumnTitle" name="title" class="input flex-1 text-sm" placeholder="Nome da coluna..." />
              <input [(ngModel)]="newColumnColor" type="color" name="color" class="h-9 w-10 rounded border border-gray-300 cursor-pointer" />
              <button type="submit" class="btn-primary text-sm">Criar</button>
              <button type="button" (click)="showColumnForm.set(false)" class="btn-secondary text-sm">✕</button>
            </form>
          }

          <div class="space-y-2">
            @for (col of columnsService.columns(); track col.id) {
              <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <span class="w-3 h-3 rounded-full shrink-0" [style.background-color]="col.color ?? '#6366f1'"></span>
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ col.title }}</span>
                <span class="text-xs text-gray-400">ordem {{ col.order }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Dark mode -->
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark mode</p>
              <p class="text-xs text-gray-400 mt-0.5">Alternar entre tema claro e escuro</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input
                type="checkbox"
                [checked]="isDark()"
                (change)="toggleDarkMode()"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  readonly settings = signal<UserSettings | null>(null);
  readonly showColumnForm = signal(false);
  readonly isDark = signal(false);
  newColumnTitle = '';
  newColumnColor = '#6366f1';

  private readonly url = `${environment.apiUrl}/settings`;

  constructor(
    private readonly http: HttpClient,
    readonly columnsService: ColumnsService,
  ) {}

  ngOnInit(): void {
    this.http.get<{ data: UserSettings }>(this.url).subscribe((res) => this.settings.set(res.data));
    this.columnsService.loadAll().subscribe();
    this.isDark.set(document.documentElement.classList.contains('dark'));
  }

  updateAutoAdvance(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.http
      .patch<{ data: UserSettings }>(this.url, { autoAdvanceStatus: checked })
      .subscribe((res) => this.settings.set(res.data));
  }

  createColumn(): void {
    if (!this.newColumnTitle.trim()) return;
    this.columnsService.create(this.newColumnTitle, this.newColumnColor).subscribe();
    this.newColumnTitle = '';
    this.newColumnColor = '#6366f1';
    this.showColumnForm.set(false);
  }

  toggleDarkMode(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    this.isDark.set(html.classList.contains('dark'));
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }
}

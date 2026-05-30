import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  readonly isDark = signal(false);

  private readonly url = `${environment.apiUrl}/settings`;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ data: UserSettings }>(this.url).subscribe((res) => this.settings.set(res.data));
    this.isDark.set(document.documentElement.classList.contains('dark'));
  }

  updateAutoAdvance(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.http
      .patch<{ data: UserSettings }>(this.url, { autoAdvanceStatus: checked })
      .subscribe((res) => this.settings.set(res.data));
  }

  toggleDarkMode(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    this.isDark.set(html.classList.contains('dark'));
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }
}

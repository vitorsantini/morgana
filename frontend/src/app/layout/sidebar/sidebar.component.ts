import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../core/services/projects.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="w-64 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
      <!-- Logo -->
      <div class="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <span class="text-xl font-bold text-primary-600">Morgana</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/>
          </svg>
          Dashboard
        </a>

        <!-- Projects section -->
        <div class="pt-4">
          <div class="flex items-center justify-between px-3 mb-1">
            <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Projetos</span>
            <button
              (click)="showNewProject.set(true)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Novo projeto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>

          <a
            routerLink="/projects"
            routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            <span class="truncate">Painel Geral</span>
          </a>

          @for (project of activeProjects(); track project.id) {
            <a
              [routerLink]="['/projects', project.id]"
              routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                [style.background-color]="project.color ?? '#6366f1'"
              ></span>
              <span class="truncate">{{ project.name }}</span>
            </a>
          }

          @if (showNewProject()) {
            <form (submit)="createProject($event)" class="mt-1 px-3">
              <input
                #newProjectInput
                type="text"
                placeholder="Nome do projeto..."
                class="input text-xs py-1.5"
                (keydown.escape)="showNewProject.set(false)"
              />
            </form>
          }
        </div>

        <!-- Notes, Habits, Goals -->
        <div class="pt-4 space-y-1">
          <span class="block px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Ferramentas</span>

          <a routerLink="/notes" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Notas
          </a>

          <a routerLink="/habits" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Hábitos
          </a>

          <a routerLink="/goals" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            Metas
          </a>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <a routerLink="/settings" class="btn-ghost text-xs gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Configurações
          </a>
          <button (click)="logout()" class="btn-ghost text-xs text-red-500 hover:text-red-700">
            Sair
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly showNewProject = signal(false);

  readonly activeProjects = computed(() =>
    this.projectsService.projects().filter((p) => !p.archived),
  );

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly authService: AuthService,
  ) {}

  createProject(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const name = input.value.trim();

    if (name) {
      this.projectsService.create(name).subscribe();
    }
    this.showNewProject.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}

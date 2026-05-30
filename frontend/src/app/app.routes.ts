import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./features/auth/callback/callback.component').then((m) => m.CallbackComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/board/board.component').then((m) => m.BoardComponent),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/board/board.component').then((m) => m.BoardComponent),
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('./features/notes/notes-list/notes-list.component').then((m) => m.NotesListComponent),
      },
      {
        path: 'notes/:id',
        loadComponent: () =>
          import('./features/notes/note-editor/note-editor.component').then((m) => m.NoteEditorComponent),
      },
      {
        path: 'habits',
        loadComponent: () =>
          import('./features/habits/habits.component').then((m) => m.HabitsComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals.component').then((m) => m.GoalsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

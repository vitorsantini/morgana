import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-600">Morgana</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Crie sua conta</p>
        </div>

        <div class="card p-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Criar conta</h2>

          @if (error()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="label">Nome</label>
              <input type="text" [(ngModel)]="name" name="name" class="input" placeholder="Seu nome" required />
            </div>
            <div>
              <label class="label">E-mail</label>
              <input type="email" [(ngModel)]="email" name="email" class="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label class="label">Senha</label>
              <input type="password" [(ngModel)]="password" name="password" class="input" placeholder="Mínimo 8 caracteres" minlength="8" required />
            </div>
            <button type="submit" class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) { Criando conta... } @else { Criar conta }
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Já tem conta?
            <a routerLink="/auth/login" class="text-primary-600 hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.email, this.name, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erro ao criar conta');
        this.loading.set(false);
      },
    });
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
    private readonly router: Router,
  ) {
    if (this.tokenService.isLoggedIn()) {
      this.loadCurrentUser();
    }
  }

  register(email: string, name: string, password: string): Observable<{ data: AuthTokens }> {
    return this.http
      .post<{ data: AuthTokens }>(`${this.apiUrl}/auth/register`, { email, name, password })
      .pipe(tap((res) => this.handleTokens(res.data)));
  }

  login(email: string, password: string): Observable<{ data: AuthTokens }> {
    return this.http
      .post<{ data: AuthTokens }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.handleTokens(res.data)));
  }

  refresh(): Observable<{ data: { accessToken: string } }> {
    return this.http
      .post<{ data: { accessToken: string } }>(`${this.apiUrl}/auth/refresh`, {})
      .pipe(tap((res) => this.tokenService.setAccessToken(res.data.accessToken)));
  }

  logout(): void {
    this.tokenService.clearTokens();
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  handleOAuthCallback(accessToken: string, refreshToken: string): void {
    this.tokenService.setTokens(accessToken, refreshToken);
    this.loadCurrentUser();
    this.router.navigate(['/']);
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  private handleTokens(tokens: AuthTokens): void {
    this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.http
      .get<{ data: User }>(`${this.apiUrl}/auth/me`)
      .subscribe({
        next: (res) => this._user.set(res.data),
        error: () => this.tokenService.clearTokens(),
      });
  }
}

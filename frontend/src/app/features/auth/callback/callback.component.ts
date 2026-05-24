import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-gray-500">Autenticando...</p>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];
      if (accessToken && refreshToken) {
        this.authService.handleOAuthCallback(accessToken, refreshToken);
      }
    });
  }
}

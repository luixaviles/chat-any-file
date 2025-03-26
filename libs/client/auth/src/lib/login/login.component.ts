import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth-service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h2>Welcome</h2>
      <p>Please sign in to continue</p>

      <button 
        (click)="signInWithGoogle()" 
        [disabled]="loading$ | async"
        class="google-btn"
      >
        @if (loading$ | async) {
          <span class="spinner"></span>
        } @else {
          <span class="google-icon"></span>
          Sign in with Google
        }
      </button>

      @if (error$ | async; as error) {
        <div class="error-message">
          {{ error }}
        </div>
      }
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px 24px;
      background-color: #fff;
      color: #757575;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
    }

    .google-btn:hover:not(:disabled) {
      background-color: #f8f8f8;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .google-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .google-icon {
      width: 18px;
      height: 18px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDExLjA0IDAgMCAxMS4wNCAwIDI0YzAgMTIuOTYgMTEuMDQgMjQgMjQgMjRzMjQtMTEuMDQgMjQtMjRoLTEyYzAgNi42My01LjM3IDEyLTEyIDEycy0xMi01LjM3LTEyLTEyIDUuMzctMTIgMTItMTJ6Ii8+PC9zdmc+');
      background-size: contain;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #757575;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      color: #dc3545;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loading$ = this.authService.loading$;
  error$ = this.authService.error$;

  constructor() {
    // Redirect to returnUrl or default route when user is authenticated
    this.authService.user$.pipe(
      takeUntilDestroyed()
    ).subscribe(user => {
      if (user) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  signInWithGoogle(): void {
    this.authService.signInWithGoogle().subscribe({
      error: () => {
        // Error is handled by the service and displayed via error$
      }
    });
  }
} 
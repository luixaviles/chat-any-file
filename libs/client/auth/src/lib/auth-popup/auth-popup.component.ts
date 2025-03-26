import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs';
import { EMPTY } from 'rxjs';
import { AuthService } from '../auth-service/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'corp-auth-popup',
  imports: [CommonModule, Dialog, ButtonModule, InputTextModule],
  templateUrl: './auth-popup.component.html',
  styleUrl: './auth-popup.component.scss',
  providers: [MessageService]
})
export class AuthPopupComponent {
  visible = signal(false);
  authService = inject(AuthService);
  messageService = inject(MessageService);

  success = output<void>();

  showDialog() {
      this.visible.set(true);
  }

  closeDialog() {
      this.visible.set(false);
  }

  loginWithGoogle() {
    this.authService.signInWithGoogle().pipe(
      tap(() => {
        this.closeDialog();
        this.success.emit();
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return EMPTY;
      })
    ).subscribe();
  }
}

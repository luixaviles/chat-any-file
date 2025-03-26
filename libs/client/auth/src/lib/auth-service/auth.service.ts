import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthState, UserProfile, AuthError } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  readonly authState$ = this.authState.asObservable();
  readonly user$ = this.authState$.pipe(map(state => state.user));
  readonly loading$ = this.authState$.pipe(map(state => state.loading));
  readonly error$ = this.authState$.pipe(map(state => state.error));

  constructor() {
    // Initialize auth state listener
    onAuthStateChanged(
      this.auth,
      (user) => {
        this.updateAuthState({
          user: user ? this.mapUserToProfile(user) : null,
          loading: false,
          error: null
        });
      },
      (error) => {
        this.handleAuthError(error);
      }
    );
  }

  signInWithGoogle(): Observable<UserProfile> {
    this.updateAuthState({ ...this.authState.value, loading: true, error: null });
    
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map(result => this.mapUserToProfile(result.user)),
      tap(user => {
        this.updateAuthState({
          user,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.handleAuthError(error);
        throw error;
      })
    );
  }

  signOut(): Observable<void> {
    this.updateAuthState({ ...this.authState.value, loading: true, error: null });
    
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.updateAuthState({
          user: null,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.handleAuthError(error);
        throw error;
      })
    );
  }

  getIdToken(forceRefresh = false): Observable<string> {
    return from(this.auth.currentUser?.getIdToken(forceRefresh) || Promise.reject('No user logged in')).pipe(
      catchError(error => {
        this.handleAuthError(error);
        throw error;
      })
    );
  }

  async getAuthorizationHeaders(): Promise<{ [key: string]: string }> {
    try {
      const token = await this.auth.currentUser?.getIdToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch (error) {
      this.handleAuthError(error);
      return {};
    }
  }

  private mapUserToProfile(user: User): UserProfile {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  private updateAuthState(state: AuthState): void {
    this.authState.next(state);
  }

  private handleAuthError(error: any): void {
    console.error('Authentication error:', error);
    const authError: AuthError = {
      code: error.code || 'unknown',
      message: error.message || 'An unknown error occurred'
    };
    
    this.updateAuthState({
      ...this.authState.value,
      loading: false,
      error: authError.message
    });
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  isLoggedInSync(): boolean {
    return !!this.authState.value.user;
  }
} 
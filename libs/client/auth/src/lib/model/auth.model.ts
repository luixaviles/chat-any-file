export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthError = {
  code: string;
  message: string;
} 
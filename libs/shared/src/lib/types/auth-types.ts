export interface UserRequest {
  uid?: string;
  email?: string;
  isAnonymous: boolean;
}

export interface AnonymousLimitError {
  status: number;
  error: 'ANONYMOUS_LIMIT_EXCEEDED';
  message: string;
}

export function isAnonymousLimitError(error: any): error is AnonymousLimitError {
  return error?.error === 'ANONYMOUS_LIMIT_EXCEEDED';
}
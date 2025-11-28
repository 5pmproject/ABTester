/**
 * Custom Error Classes
 * Supabase 에러를 사용자 친화적 메시지로 변환
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    
    // TypeScript에서 Error 클래스 상속 시 필요
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class AuthError extends ApiError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = '네트워크 연결을 확인해주세요') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Supabase 에러 코드를 사용자 친화적 메시지로 변환
 */
export function handleSupabaseError(error: any, language: 'ko' | 'en' = 'ko'): ApiError {
  const messages = {
    ko: {
      PGRST116: '데이터를 찾을 수 없습니다',
      '23505': '이미 존재하는 데이터입니다',
      '23503': '관련된 데이터가 존재하여 삭제할 수 없습니다',
      '42501': '접근 권한이 없습니다',
      'invalid_grant': '이메일 또는 비밀번호가 올바르지 않습니다',
      'user_already_exists': '이미 가입된 이메일입니다',
      'weak_password': '비밀번호는 최소 6자 이상이어야 합니다',
      'email_not_confirmed': '이메일 인증이 필요합니다',
      'network': '네트워크 연결을 확인해주세요',
      'unknown': '알 수 없는 오류가 발생했습니다',
    },
    en: {
      PGRST116: 'Data not found',
      '23505': 'Data already exists',
      '23503': 'Cannot delete due to related data',
      '42501': 'Access denied',
      'invalid_grant': 'Invalid email or password',
      'user_already_exists': 'Email already registered',
      'weak_password': 'Password must be at least 6 characters',
      'email_not_confirmed': 'Email confirmation required',
      'network': 'Please check your network connection',
      'unknown': 'An unknown error occurred',
    },
  };

  const msg = messages[language];
  
  // PostgreSQL 에러 코드
  if (error.code === 'PGRST116') {
    return new ApiError(msg.PGRST116, 'NOT_FOUND', 404);
  }
  if (error.code === '23505') {
    return new ApiError(msg['23505'], 'DUPLICATE', 409);
  }
  if (error.code === '23503') {
    return new ApiError(msg['23503'], 'FOREIGN_KEY_VIOLATION', 409);
  }
  if (error.code === '42501') {
    return new AuthError(msg['42501'], 'PERMISSION_DENIED');
  }

  // Supabase Auth 에러
  if (error.message?.includes('Invalid login credentials')) {
    return new AuthError(msg.invalid_grant, 'INVALID_CREDENTIALS');
  }
  if (error.message?.includes('User already registered')) {
    return new AuthError(msg.user_already_exists, 'USER_EXISTS');
  }
  if (error.message?.includes('Password should be')) {
    return new AuthError(msg.weak_password, 'WEAK_PASSWORD');
  }
  if (error.message?.includes('Email not confirmed')) {
    return new AuthError(msg.email_not_confirmed, 'EMAIL_NOT_CONFIRMED');
  }

  // 네트워크 에러
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new NetworkError(msg.network);
  }

  // 기본 에러
  return new ApiError(
    error.message || msg.unknown,
    error.code || 'UNKNOWN',
    error.status || 500,
    error
  );
}

/**
 * 에러 로깅 헬퍼
 */
export function logError(context: string, error: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  
  // 프로덕션에서는 에러 트래킹 서비스로 전송 가능
  // 예: Sentry, LogRocket 등
}


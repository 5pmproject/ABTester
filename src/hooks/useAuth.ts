import { useState, useEffect, useCallback } from 'react';
import { authService, AuthUser, Profile } from '../services/auth.service';
import { handleSupabaseError, logError } from '../lib/utils/errors';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface UseAuthOptions {
  language?: 'ko' | 'en';
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string, company?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; company?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isOnline: boolean;
}

/**
 * 인증 관리를 위한 Custom Hook
 * Supabase Auth 연동 + Guest Mode
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { language = 'ko' } = options;
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());

  /**
   * localStorage에서 게스트 정보 로드
   */
  const loadGuestUser = useCallback((): AuthUser | null => {
    try {
      const stored = localStorage.getItem('guestUser');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      logError('useAuth.loadGuestUser', err);
      return null;
    }
  }, []);

  /**
   * localStorage에 게스트 정보 저장
   */
  const saveGuestUser = useCallback((guestUser: AuthUser | null) => {
    try {
      if (guestUser) {
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
      } else {
        localStorage.removeItem('guestUser');
      }
    } catch (err) {
      logError('useAuth.saveGuestUser', err);
    }
  }, []);

  /**
   * 현재 사용자 정보 로드
   */
  const loadCurrentUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Supabase 미설정 시 게스트 모드
      const guestUser = loadGuestUser();
      setUser(guestUser);
      setIsOnline(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsOnline(true);
    } catch (err: any) {
      // AuthSessionMissingError는 정상 동작 (게스트 모드)
      if (!err.message?.includes('Auth session missing')) {
        logError('useAuth.loadCurrentUser', err);
      }
      // Fallback to guest mode
      const guestUser = loadGuestUser();
      setUser(guestUser);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [loadGuestUser]);

  /**
   * 회원가입
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    company?: string
  ) => {
    if (!isSupabaseConfigured()) {
      setError(language === 'ko' 
        ? 'Supabase가 설정되지 않았습니다. 게스트 모드를 사용하세요.' 
        : 'Supabase is not configured. Please use guest mode.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newUser = await authService.signUp(email, password, name, company);
      setUser(newUser);
      setIsOnline(true);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useAuth.signUp', err);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [language]);

  /**
   * 로그인
   */
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      setError(language === 'ko' 
        ? 'Supabase가 설정되지 않았습니다. 게스트 모드를 사용하세요.' 
        : 'Supabase is not configured. Please use guest mode.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authUser = await authService.signIn(email, password);
      setUser(authUser);
      setIsOnline(true);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useAuth.signIn', err);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [language]);

  /**
   * 로그아웃
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        await authService.signOut();
      }
      setUser(null);
      saveGuestUser(null);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useAuth.signOut', err);
    } finally {
      setLoading(false);
    }
  }, [language, saveGuestUser]);

  /**
   * 프로필 업데이트
   */
  const updateProfile = useCallback(async (updates: { name?: string; company?: string }) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!isSupabaseConfigured()) {
      // 게스트 모드에서 로컬 업데이트
      const updatedProfile: Profile = {
        ...user.profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const updatedUser = { ...user, profile: updatedProfile };
      setUser(updatedUser);
      saveGuestUser(updatedUser);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await authService.updateProfile(user.user.id, updates);
      setUser({
        ...user,
        profile: updatedProfile,
      });
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useAuth.updateProfile', err);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [user, language, saveGuestUser]);

  /**
   * 비밀번호 재설정 이메일 발송
   */
  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      setError(language === 'ko' 
        ? 'Supabase가 설정되지 않았습니다.' 
        : 'Supabase is not configured.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useAuth.resetPassword', err);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [language]);

  /**
   * 인증 상태 변경 리스너 등록
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const guestUser = loadGuestUser();
      setUser(guestUser);
      setIsOnline(false);
      setLoading(false);
      return;
    }

    // 초기 사용자 로드
    loadCurrentUser();

    // 인증 상태 변경 감지
    const { data: authListener } = authService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        await loadCurrentUser();
      } else {
        setUser(null);
        saveGuestUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loadCurrentUser, loadGuestUser, saveGuestUser]);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: user !== null,
    isOnline,
  };
}


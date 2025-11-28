import { supabase } from '../lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Authentication Service Layer
 * 사용자 인증 관련 모든 작업 담당
 */

export interface Profile {
  id: string;
  name: string;
  company: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  user: User;
  profile: Profile;
}

export class AuthService {
  /**
   * 회원가입
   */
  async signUp(
    email: string,
    password: string,
    name: string,
    company?: string
  ): Promise<AuthUser> {
    // 1. Supabase Auth에 사용자 생성 (트리거가 자동으로 프로필 생성)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company: company || null,
        }
      }
    });

    if (authError) {
      console.error('[AuthService.signUp] Auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // 2. 트리거가 프로필을 생성할 시간을 주기 위해 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. 생성된 프로필 조회
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (fetchError || !profile) {
      console.error('[AuthService.signUp] Profile fetch error:', fetchError);
      // 프로필이 없으면 기본값 반환 (트리거가 실행되기 전)
      return {
        user: authData.user,
        profile: {
          id: authData.user.id,
          name,
          company: company || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    return {
      user: authData.user,
      profile: {
        id: profile.id,
        name: profile.name,
        company: profile.company,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    };
  }

  /**
   * 로그인
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('[AuthService.signIn] Error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Login failed');
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    return {
      user: authData.user,
      profile: {
        id: profile.id,
        name: profile.name,
        company: profile.company,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    };
  }

  /**
   * 로그아웃
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[AuthService.signOut] Error:', error);
      throw error;
    }
  }

  /**
   * 현재 로그인된 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      // AuthSessionMissingError는 정상 동작 (게스트 모드)
      if (userError.message?.includes('Auth session missing')) {
        return null;
      }
      console.error('[AuthService.getCurrentUser] Error:', userError);
      return null;
    }

    if (!user) {
      return null;
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[AuthService.getCurrentUser] Profile error:', profileError);
      return null;
    }

    return {
      user,
      profile: {
        id: profile.id,
        name: profile.name,
        company: profile.company,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    };
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; company?: string }
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AuthService.updateProfile] Error:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * 인증 상태 변경 리스너 등록
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('[AuthService.resetPassword] Error:', error);
      throw error;
    }
  }

  /**
   * 새 비밀번호 설정
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('[AuthService.updatePassword] Error:', error);
      throw error;
    }
  }
}

// Singleton 인스턴스 export
export const authService = new AuthService();


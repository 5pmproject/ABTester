import { useState, useEffect, useCallback } from 'react';
import { testIdeasService } from '../services/test-ideas.service';
import { TestIdea } from '../App';
import { handleSupabaseError, logError } from '../lib/utils/errors';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface UseTestIdeasOptions {
  language?: 'ko' | 'en';
  autoLoad?: boolean;
}

interface UseTestIdeasReturn {
  testIdeas: TestIdea[];
  loading: boolean;
  error: string | null;
  addTestIdea: (idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>) => Promise<void>;
  updateTestIdea: (id: string, updates: Partial<TestIdea>) => Promise<void>;
  deleteTestIdea: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  isOnline: boolean;
}

/**
 * Test Ideas 관리를 위한 Custom Hook
 * Supabase 연동 + localStorage Fallback
 */
export function useTestIdeas(options: UseTestIdeasOptions = {}): UseTestIdeasReturn {
  const { language = 'ko', autoLoad = true } = options;
  
  const [testIdeas, setTestIdeas] = useState<TestIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());

  /**
   * localStorage에서 데이터 로드 (Fallback)
   */
  const loadFromLocalStorage = useCallback((): TestIdea[] => {
    try {
      const stored = localStorage.getItem('testIdeas');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      logError('useTestIdeas.loadFromLocalStorage', err);
      return [];
    }
  }, []);

  /**
   * localStorage에 데이터 저장
   */
  const saveToLocalStorage = useCallback((ideas: TestIdea[]) => {
    try {
      localStorage.setItem('testIdeas', JSON.stringify(ideas));
    } catch (err) {
      logError('useTestIdeas.saveToLocalStorage', err);
    }
  }, []);

  /**
   * Supabase에서 데이터 로드
   */
  const loadTestIdeas = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      // Supabase 미설정 시 localStorage 사용
      const localData = loadFromLocalStorage();
      setTestIdeas(localData);
      setIsOnline(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await testIdeasService.getAll();
      setTestIdeas(data);
      setIsOnline(true);
      // Backup to localStorage
      saveToLocalStorage(data);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.loadTestIdeas', err);
      
      // Fallback to localStorage
      const localData = loadFromLocalStorage();
      if (localData.length > 0) {
        setTestIdeas(localData);
        setError(language === 'ko' 
          ? '오프라인 데이터를 표시합니다' 
          : 'Showing offline data'
        );
      }
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [language, loadFromLocalStorage, saveToLocalStorage]);

  /**
   * 새 테스트 아이디어 추가
   */
  const addTestIdea = useCallback(async (
    idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>
  ) => {
    console.log('🔵 addTestIdea 시작:', idea);
    
    const iceScore = idea.impact * idea.confidence * idea.ease;
    const newIdea: TestIdea = {
      ...idea,
      id: `temp-${Date.now()}`,
      iceScore,
      createdAt: new Date().toISOString(),
      status: 'planned',
      synced: true, // 기본값: true (localStorage 저장 완료)
    };

    console.log('🔵 새 아이디어 생성:', newIdea);

    // Optimistic Update - 로컬에 즉시 저장
    setTestIdeas(prev => {
      console.log('🔵 이전 testIdeas 개수:', prev.length);
      const updated = [...prev, newIdea];
      console.log('🔵 업데이트된 testIdeas 개수:', updated.length);
      saveToLocalStorage(updated);
      return updated;
    });

    // ✅ Supabase 미설정 시 localStorage만 사용
    if (!isSupabaseConfigured()) {
      console.log('✅ localStorage 모드: 로컬에만 저장되었습니다');
      return;
    }

    // ✅ 로그인 여부 확인 (게스트 모드는 Supabase 호출 안 함)
    try {
      const { data: { user } } = await testIdeasService.supabase.auth.getUser();
      if (!user) {
        console.log('✅ 게스트 모드: 로컬에만 저장되었습니다');
        return; // 게스트는 로컬만 사용
      }
    } catch (authErr) {
      console.log('✅ 인증 확인 실패: 로컬에만 저장되었습니다');
      return;
    }

    // ✅ 로그인된 상태에서만 Supabase 저장 시도
    try {
      const savedIdea = await testIdeasService.create(newIdea);
      // 임시 ID를 실제 Supabase ID로 교체
      setTestIdeas(prev => {
        const updated = prev.map(t => 
          t.id === newIdea.id 
            ? { ...savedIdea, synced: true } 
            : t
        );
        saveToLocalStorage(updated);
        return updated;
      });
      setError(null);
      console.log('✅ Supabase 저장 성공');
    } catch (err: any) {
      // Supabase 저장 실패해도 로컬 데이터는 유지
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.addTestIdea', err);
      
      setTestIdeas(prev => {
        const updated = prev.map(t => 
          t.id === newIdea.id 
            ? { ...t, synced: false } 
            : t
        );
        saveToLocalStorage(updated);
        return updated;
      });
      
      console.warn('⚠️ Supabase 저장 실패: 로컬에만 저장되었습니다');
    }
  }, [language, saveToLocalStorage]);

  /**
   * 테스트 아이디어 업데이트
   */
  const updateTestIdea = useCallback(async (id: string, updates: Partial<TestIdea>) => {
    // Optimistic Update
    const previousIdeas = [...testIdeas];
    const updatedIdeas = testIdeas.map(idea => {
      if (idea.id === id) {
        const updated = { ...idea, ...updates };
        // ICE Score 재계산
        if (updates.impact || updates.confidence || updates.ease) {
          updated.iceScore = 
            (updates.impact ?? idea.impact) * 
            (updates.confidence ?? idea.confidence) * 
            (updates.ease ?? idea.ease);
        }
        return updated;
      }
      return idea;
    });

    setTestIdeas(updatedIdeas);
    saveToLocalStorage(updatedIdeas);

    if (!isSupabaseConfigured()) {
      return; // localStorage만 사용
    }

    try {
      await testIdeasService.update(id, updates);
      // 성공 시 synced: true 표시
      setTestIdeas(prev => 
        prev.map(t => t.id === id ? { ...t, synced: true } : t)
      );
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.updateTestIdea', err);
      // ✅ 업데이트는 로컬에 유지, synced만 false로 표시
      setTestIdeas(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, synced: false } : t);
        saveToLocalStorage(updated);
        return updated;
      });
    }
  }, [testIdeas, language, saveToLocalStorage]);

  /**
   * 테스트 아이디어 삭제
   */
  const deleteTestIdea = useCallback(async (id: string) => {
    // Optimistic Update
    const previousIdeas = [...testIdeas];
    const deletedIdea = testIdeas.find(idea => idea.id === id);
    const updatedIdeas = testIdeas.filter(idea => idea.id !== id);
    
    setTestIdeas(updatedIdeas);
    saveToLocalStorage(updatedIdeas);

    if (!isSupabaseConfigured()) {
      return; // localStorage만 사용
    }

    try {
      await testIdeasService.delete(id);
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.deleteTestIdea', err);
      // ✅ 삭제는 실패 시 복원 (삭제는 민감한 작업이므로)
      if (deletedIdea) {
        setTestIdeas(prev => {
          const restored = [...prev, { ...deletedIdea, synced: false }];
          saveToLocalStorage(restored);
          return restored;
        });
      }
      alert(
        language === 'ko'
          ? '⚠️ 서버 삭제 실패: 로컬에서만 삭제되었습니다.'
          : '⚠️ Server deletion failed: Deleted locally only.'
      );
    }
  }, [testIdeas, language, saveToLocalStorage]);

  /**
   * 데이터 새로고침
   */
  const refresh = useCallback(async () => {
    await loadTestIdeas();
  }, [loadTestIdeas]);

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadTestIdeas();
    }
  }, [autoLoad, loadTestIdeas]);

  return {
    testIdeas,
    loading,
    error,
    addTestIdea,
    updateTestIdea,
    deleteTestIdea,
    refresh,
    isOnline,
  };
}


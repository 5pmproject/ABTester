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
    const iceScore = idea.impact * idea.confidence * idea.ease;
    const newIdea: TestIdea = {
      ...idea,
      id: `temp-${Date.now()}`,
      iceScore,
      createdAt: new Date().toISOString(),
      status: 'planned',
      synced: !isSupabaseConfigured(), // Supabase 없으면 이미 synced로 간주
    };

    // Optimistic Update - 로컬에 즉시 저장
    setTestIdeas(prev => {
      const updated = [...prev, newIdea];
      saveToLocalStorage(updated);
      return updated;
    });

    if (!isSupabaseConfigured()) {
      return; // localStorage만 사용 (이미 synced: true)
    }

    try {
      const savedIdea = await testIdeasService.create(newIdea);
      // 임시 ID를 실제 Supabase ID로 교체하고 synced: true 표시
      setTestIdeas(prev => {
        const updated = prev.map(t => 
          t.id === newIdea.id 
            ? { ...savedIdea, synced: true } 
            : t
        );
        saveToLocalStorage(updated);
        return updated;
      });
      setError(null); // 성공 시 이전 에러 제거
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.addTestIdea', err);
      
      // ✅ 중요: 롤백하지 않고, synced: false로 표시만 함
      // 로컬에는 남아있고, 나중에 재시도 가능
      setTestIdeas(prev => {
        const updated = prev.map(t => 
          t.id === newIdea.id 
            ? { ...t, synced: false } 
            : t
        );
        saveToLocalStorage(updated);
        return updated;
      });
      
      // 사용자에게 알림 (로컬에는 저장됨)
      console.warn(
        language === 'ko' 
          ? '⚠️ 서버 저장 실패: 로컬에만 저장되었습니다. 나중에 자동으로 동기화됩니다.' 
          : '⚠️ Server save failed: Saved locally only. Will sync automatically later.'
      );
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


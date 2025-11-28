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
    };

    // Optimistic Update
    setTestIdeas(prev => [...prev, newIdea]);
    saveToLocalStorage([...testIdeas, newIdea]);

    if (!isSupabaseConfigured()) {
      return; // localStorage만 사용
    }

    try {
      const savedIdea = await testIdeasService.create(newIdea);
      // 임시 ID를 실제 ID로 교체
      setTestIdeas(prev => prev.map(t => t.id === newIdea.id ? savedIdea : t));
      saveToLocalStorage(testIdeas.map(t => t.id === newIdea.id ? savedIdea : t));
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.addTestIdea', err);
      // Rollback on error
      setTestIdeas(prev => prev.filter(t => t.id !== newIdea.id));
    }
  }, [testIdeas, language, saveToLocalStorage]);

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
    } catch (err: any) {
      const apiError = handleSupabaseError(err, language);
      setError(apiError.message);
      logError('useTestIdeas.updateTestIdea', err);
      // Rollback on error
      setTestIdeas(previousIdeas);
      saveToLocalStorage(previousIdeas);
    }
  }, [testIdeas, language, saveToLocalStorage]);

  /**
   * 테스트 아이디어 삭제
   */
  const deleteTestIdea = useCallback(async (id: string) => {
    // Optimistic Update
    const previousIdeas = [...testIdeas];
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
      // Rollback on error
      setTestIdeas(previousIdeas);
      saveToLocalStorage(previousIdeas);
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


# 🔍 코드 리뷰 - DATA_FLOW_COMPLETE.md 기준

**리뷰 일시**: 2025-11-29
**리뷰 대상**: 테스트 아이디어 추가 전체 플로우
**심각도 분류**: 🔴 Critical | 🟡 Warning | 🟢 Minor | 💡 Suggestion

---

## 📊 요약

| 심각도 | 개수 | 주요 이슈 |
|--------|------|-----------|
| 🔴 Critical | 3 | Race Condition, 동시성 문제, 임시 ID 충돌 |
| 🟡 Warning | 5 | 성능 저하, localStorage quota, 에러 처리 |
| 🟢 Minor | 4 | 코드 품질, 타입 안정성 |
| 💡 Suggestion | 6 | 아키텍처 개선, UX 향상 |

---

## 🔴 Critical Issues

### 1. Race Condition - 동시 작업 충돌

**위치**: `src/hooks/useTestIdeas.ts:103-145`

**문제**:
```typescript
const addTestIdea = useCallback(async (idea) => {
  // 1. Optimistic Update
  setTestIdeas(prev => {
    const updated = [...prev, newIdea];
    saveToLocalStorage(updated);
    return updated;
  });

  // 2. Supabase 저장 (비동기)
  const savedIdea = await testIdeasService.create(newIdea);
  
  // 3. ID 교체
  setTestIdeas(prev => {
    const updated = prev.map(t => t.id === newIdea.id ? savedIdea : t);
    saveToLocalStorage(updated);
    return updated;
  });
}, [language, saveToLocalStorage]);
```

**시나리오**:
1. 사용자가 아이디어 A 추가 (Supabase 저장 중...)
2. 1초 후 아이디어 B 추가 (Supabase 저장 중...)
3. B의 Supabase 저장이 먼저 완료됨
4. A의 Supabase 저장이 나중에 완료됨
5. → **B의 실제 ID가 A의 ID 교체 시 사라질 수 있음**

**영향**: 데이터 손실 가능

**해결 방안**:
```typescript
const addTestIdea = useCallback(async (idea) => {
  const tempId = `temp-${Date.now()}-${Math.random()}`;
  const newIdea: TestIdea = { ...idea, id: tempId, ... };

  // Queue 관리
  const pendingOperations = new Map<string, Promise<void>>();
  
  setTestIdeas(prev => [...prev, newIdea]);
  
  if (!isSupabaseConfigured()) return;

  const operation = testIdeasService.create(newIdea)
    .then(savedIdea => {
      setTestIdeas(prev => 
        prev.map(t => t.id === tempId ? savedIdea : t)
      );
    });
  
  pendingOperations.set(tempId, operation);
  await operation;
  pendingOperations.delete(tempId);
}, []);
```

**우선순위**: 🔴 **HIGH** - 즉시 수정 필요

---

### 2. 임시 ID 충돌 가능성

**위치**: `src/hooks/useTestIdeas.ts:109`

**문제**:
```typescript
id: `temp-${Date.now()}`
```

**시나리오**:
- 같은 밀리초 내에 2개의 아이디어 추가
- → 같은 ID 생성
- → 하나의 아이디어만 표시됨

**실제 발생 가능성**: 
- 빠른 클릭 또는 테스트 코드에서 매우 높음
- 프로덕션에서도 발생 가능

**영향**: 데이터 손실

**해결 방안**:
```typescript
// 방법 1: 카운터 추가
let tempIdCounter = 0;
id: `temp-${Date.now()}-${++tempIdCounter}`

// 방법 2: UUID 사용 (권장)
import { v4 as uuidv4 } from 'uuid';
id: `temp-${uuidv4()}`

// 방법 3: Crypto API (브라우저 네이티브)
id: `temp-${crypto.randomUUID()}`
```

**우선순위**: 🔴 **HIGH**

---

### 3. localStorage Quota 초과 처리 없음

**위치**: `src/hooks/useTestIdeas.ts:51-57`

**문제**:
```typescript
const saveToLocalStorage = useCallback((ideas: TestIdea[]) => {
  try {
    localStorage.setItem('testIdeas', JSON.stringify(ideas));
  } catch (err) {
    logError('useTestIdeas.saveToLocalStorage', err);
    // ❌ 에러만 로그하고 끝
  }
}, []);
```

**시나리오**:
1. 사용자가 수백 개의 아이디어 추가
2. localStorage quota 초과 (브라우저마다 5-10MB)
3. `QuotaExceededError` 발생
4. → **데이터가 저장 안 되는데 사용자는 모름**
5. → 페이지 새로고침 시 데이터 손실

**영향**: 
- 데이터 손실
- 나쁜 UX (에러 알림 없음)

**해결 방안**:
```typescript
const saveToLocalStorage = useCallback((ideas: TestIdea[]) => {
  try {
    const data = JSON.stringify(ideas);
    localStorage.setItem('testIdeas', data);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      // Quota 초과 처리
      console.warn('LocalStorage quota exceeded. Keeping only recent 100 ideas.');
      
      // 최근 100개만 유지
      const recentIdeas = ideas
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 100);
      
      try {
        localStorage.setItem('testIdeas', JSON.stringify(recentIdeas));
        
        // 사용자에게 알림
        alert(language === 'ko' 
          ? '저장 공간이 부족합니다. 최근 100개 아이디어만 유지됩니다.' 
          : 'Storage quota exceeded. Keeping only recent 100 ideas.'
        );
      } catch (retryErr) {
        // 그래도 실패하면 Supabase에만 의존
        console.error('Failed to save even truncated data:', retryErr);
        setError(language === 'ko'
          ? '로컬 저장 실패. 온라인 연결이 필요합니다.'
          : 'Local save failed. Online connection required.'
        );
      }
    } else {
      logError('useTestIdeas.saveToLocalStorage', err);
    }
  }
}, [language]);
```

**우선순위**: 🔴 **MEDIUM-HIGH**

---

## 🟡 Warning Issues

### 4. 성능 저하 - useCallback Dependencies

**위치**: `src/hooks/useTestIdeas.ts:150, 190`

**문제**:
```typescript
const updateTestIdea = useCallback(async (id, updates) => {
  const previousIdeas = [...testIdeas];  // ← testIdeas 사용
  const updatedIdeas = testIdeas.map(...); // ← testIdeas 사용
  // ...
}, [testIdeas, language, saveToLocalStorage]);
//  ^^^^^^^^^ 이게 바뀔 때마다 함수 재생성

const deleteTestIdea = useCallback(async (id) => {
  const previousIdeas = [...testIdeas];  // ← testIdeas 사용
  const updatedIdeas = testIdeas.filter(...); // ← testIdeas 사용
  // ...
}, [testIdeas, language, saveToLocalStorage]);
//  ^^^^^^^^^ 이게 바뀔 때마다 함수 재생성
```

**영향**:
- 아이디어가 추가/수정/삭제될 때마다 함수 재생성
- 모든 자식 컴포넌트 리렌더링
- Props 비교 실패
- 성능 저하 (특히 TestIdeas에서 수백 개 아이템)

**해결 방안**:
```typescript
const updateTestIdea = useCallback(async (id, updates) => {
  // setState의 함수형 업데이트 사용
  const previousIdeas = useRef<TestIdea[]>([]);
  
  setTestIdeas(prev => {
    previousIdeas.current = prev;
    const updated = prev.map(idea => {
      if (idea.id === id) {
        const result = { ...idea, ...updates };
        if (updates.impact || updates.confidence || updates.ease) {
          result.iceScore = 
            (updates.impact ?? idea.impact) * 
            (updates.confidence ?? idea.confidence) * 
            (updates.ease ?? idea.ease);
        }
        return result;
      }
      return idea;
    });
    saveToLocalStorage(updated);
    return updated;
  });

  if (!isSupabaseConfigured()) return;

  try {
    await testIdeasService.update(id, updates);
  } catch (err: any) {
    const apiError = handleSupabaseError(err, language);
    setError(apiError.message);
    logError('useTestIdeas.updateTestIdea', err);
    // Rollback
    setTestIdeas(previousIdeas.current);
    saveToLocalStorage(previousIdeas.current);
  }
}, [language, saveToLocalStorage]);
// testIdeas 제거됨! ✅
```

**우선순위**: 🟡 **MEDIUM**

---

### 5. Supabase getUser() 반복 호출

**위치**: `src/services/test-ideas.service.ts:68, 135, 163`

**문제**:
```typescript
async create(idea) {
  const { data: { user } } = await supabase.auth.getUser(); // API 호출
  // ...
}

async getTopIdeas(limit) {
  const { data: { user } } = await supabase.auth.getUser(); // 또 API 호출
  // ...
}

async getMonthlyPerformance() {
  const { data: { user } } = await supabase.auth.getUser(); // 또 API 호출
  // ...
}
```

**영향**:
- 불필요한 네트워크 요청
- 성능 저하
- 비용 증가 (Supabase 요청 수)

**해결 방안**:
```typescript
export class TestIdeasService {
  private userCache: { user: User | null; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 60000; // 1분

  private async getUser(): Promise<User> {
    const now = Date.now();
    
    // 캐시 유효성 검사
    if (this.userCache && (now - this.userCache.timestamp) < this.CACHE_DURATION) {
      if (this.userCache.user) return this.userCache.user;
    }

    // 캐시 만료 또는 없음
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('User must be authenticated');
    }

    this.userCache = { user, timestamp: now };
    return user;
  }

  async create(idea) {
    const user = await this.getUser(); // 캐시된 사용자
    // ...
  }
}
```

**우선순위**: 🟡 **MEDIUM**

---

### 6. 게스트 모드 데이터 동기화 문제

**위치**: `src/hooks/useTestIdeas.ts:62-98`

**문제**:
```typescript
const loadTestIdeas = useCallback(async () => {
  if (!isSupabaseConfigured()) {
    const localData = loadFromLocalStorage();
    setTestIdeas(localData);
    setIsOnline(false);
    return;  // ← 여기서 끝
  }

  try {
    const data = await testIdeasService.getAll();
    setTestIdeas(data);
    saveToLocalStorage(data);  // ← Supabase → localStorage (덮어쓰기)
  } catch (err) {
    const localData = loadFromLocalStorage();
    setTestIdeas(localData);
  }
}, []);
```

**시나리오**:
1. 게스트 모드로 아이디어 10개 추가 (localStorage)
2. 로그인
3. `loadTestIdeas()` 호출
4. Supabase에서 빈 배열 가져옴
5. → **localStorage의 10개 아이디어 덮어씀**
6. → 데이터 손실

**영향**: 게스트 데이터 손실

**해결 방안**:
```typescript
const loadTestIdeas = useCallback(async () => {
  // 1. localStorage 먼저 로드
  const localData = loadFromLocalStorage();
  
  if (!isSupabaseConfigured()) {
    setTestIdeas(localData);
    setIsOnline(false);
    return;
  }

  setLoading(true);
  try {
    const serverData = await testIdeasService.getAll();
    
    // 2. 병합 로직
    const merged = mergeIdeas(localData, serverData);
    
    setTestIdeas(merged);
    saveToLocalStorage(merged);
    setIsOnline(true);
  } catch (err) {
    setTestIdeas(localData);
    setIsOnline(false);
  } finally {
    setLoading(false);
  }
}, []);

function mergeIdeas(local: TestIdea[], server: TestIdea[]): TestIdea[] {
  const serverIds = new Set(server.map(i => i.id));
  
  // 서버에 없는 로컬 아이디어 찾기 (temp- ID)
  const localOnly = local.filter(i => 
    i.id.startsWith('temp-') && !serverIds.has(i.id)
  );
  
  // 서버 데이터 + 로컬 전용 데이터
  return [...server, ...localOnly];
}
```

**우선순위**: 🟡 **HIGH**

---

### 7. 네트워크 재연결 시 자동 동기화 없음

**문제**:
- 오프라인 → 온라인 전환 시 자동 sync 없음
- 사용자가 수동으로 새로고침 해야 함

**해결 방안**:
```typescript
useEffect(() => {
  const handleOnline = () => {
    console.log('Network reconnected, syncing...');
    loadTestIdeas();  // 자동 동기화
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, [loadTestIdeas]);
```

**우선순위**: 🟡 **MEDIUM**

---

### 8. Error Boundary 없음

**위치**: 전체 앱

**문제**:
- React 에러 발생 시 전체 앱 크래시
- 사용자에게 빈 화면만 표시

**해결 방안**:
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError('ErrorBoundary', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>앗, 문제가 발생했습니다</h1>
          <button onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// App.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**우선순위**: 🟡 **MEDIUM**

---

## 🟢 Minor Issues

### 9. 타입 안정성 - 'any' 사용

**위치**: 여러 곳

```typescript
} catch (err: any) {  // ← any
  const apiError = handleSupabaseError(err, language);
}
```

**개선**:
```typescript
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  const apiError = handleSupabaseError(error, language);
}
```

**우선순위**: 🟢 **LOW**

---

### 10. Console.log 남아있음

**위치**: `src/services/test-ideas.service.ts` 여러 곳

```typescript
if (error) {
  console.error('[TestIdeasService.getAll] Error:', error);
  throw error;
}
```

**문제**: 
- 프로덕션에서 불필요
- 보안 정보 노출 가능

**개선**:
```typescript
if (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[TestIdeasService.getAll] Error:', error);
  }
  logError('TestIdeasService.getAll', error); // 중앙 로깅 시스템
  throw error;
}
```

**우선순위**: 🟢 **LOW**

---

### 11. localStorage 파싱 에러 처리 불충분

**위치**: `src/hooks/useTestIdeas.ts:38-46`

```typescript
const loadFromLocalStorage = useCallback((): TestIdea[] => {
  try {
    const stored = localStorage.getItem('testIdeas');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    logError('useTestIdeas.loadFromLocalStorage', err);
    return [];  // ← 에러 시 빈 배열
  }
}, []);
```

**문제**:
- 데이터가 손상되면 조용히 실패
- 사용자에게 알림 없음

**개선**:
```typescript
const loadFromLocalStorage = useCallback((): TestIdea[] => {
  try {
    const stored = localStorage.getItem('testIdeas');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // 유효성 검사
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid data format');
    }
    
    return parsed;
  } catch (err) {
    logError('useTestIdeas.loadFromLocalStorage', err);
    
    // 손상된 데이터 백업 후 삭제
    const corrupted = localStorage.getItem('testIdeas');
    if (corrupted) {
      localStorage.setItem('testIdeas_corrupted', corrupted);
      localStorage.removeItem('testIdeas');
    }
    
    // 사용자 알림
    setError(language === 'ko'
      ? '로컬 데이터가 손상되었습니다. 서버에서 복구 중...'
      : 'Local data corrupted. Recovering from server...'
    );
    
    return [];
  }
}, [language]);
```

**우선순위**: 🟢 **MEDIUM-LOW**

---

### 12. 대용량 데이터 처리

**문제**:
- 수천 개의 아이디어가 있으면?
- 전체 배열을 매번 렌더링
- localStorage에 수 MB 저장

**개선**:
```typescript
// 1. Pagination
const [page, setPage] = useState(1);
const PAGE_SIZE = 50;
const paginatedIdeas = testIdeas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// 2. Virtual Scrolling (react-window)
import { FixedSizeList } from 'react-window';

// 3. IndexedDB 사용 (localStorage 대신)
import { openDB } from 'idb';
```

**우선순위**: 🟢 **LOW** (현재는 문제 없을 것)

---

## 💡 Suggestions

### 13. Optimistic Update 개선

**현재**:
- 에러 시 롤백만 함
- 사용자에게 "저장 중..." 표시 없음

**제안**:
```typescript
const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

const addTestIdea = async (idea) => {
  const newIdea = { ...idea, id: tempId, ... };
  
  // UI에 "저장 중" 표시
  setSavingIds(prev => new Set(prev).add(tempId));
  
  setTestIdeas(prev => [...prev, newIdea]);
  
  try {
    const saved = await testIdeasService.create(newIdea);
    setTestIdeas(prev => prev.map(t => t.id === tempId ? saved : t));
  } catch (err) {
    // 롤백 + 사용자 알림
    alert('저장 실패: ' + err.message);
    setTestIdeas(prev => prev.filter(t => t.id !== tempId));
  } finally {
    setSavingIds(prev => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  }
};

// UI에서 사용
{testIdeas.map(idea => (
  <div className={savingIds.has(idea.id) ? 'saving' : ''}>
    {idea.name}
    {savingIds.has(idea.id) && <Spinner />}
  </div>
))}
```

---

### 14. 충돌 해결 전략

**시나리오**:
- 사용자 A가 아이디어 수정
- 사용자 B가 같은 아이디어 수정
- → 누구의 변경사항이 유지되나?

**제안**:
```typescript
// Last-Write-Wins with timestamp
interface TestIdea {
  // ...
  version: number;
  updatedAt: string;
}

const updateTestIdea = async (id, updates) => {
  try {
    const result = await testIdeasService.update(id, {
      ...updates,
      version: currentIdea.version + 1
    });
    setTestIdeas(prev => prev.map(t => t.id === id ? result : t));
  } catch (err) {
    if (err.code === 'VERSION_CONFLICT') {
      // 충돌 해결 UI 표시
      showConflictResolution(currentIdea, serverIdea);
    }
  }
};
```

---

### 15. 배치 작업 지원

**현재**: 아이디어를 하나씩만 추가 가능

**제안**:
```typescript
const addTestIdeas = async (ideas: NewTestIdea[]) => {
  const newIdeas = ideas.map(idea => ({
    ...idea,
    id: `temp-${crypto.randomUUID()}`,
    iceScore: idea.impact * idea.confidence * idea.ease,
    createdAt: new Date().toISOString(),
    status: 'planned' as const
  }));

  setTestIdeas(prev => [...prev, ...newIdeas]);

  if (!isSupabaseConfigured()) return;

  try {
    // Supabase batch insert
    const saved = await testIdeasService.createBatch(newIdeas);
    setTestIdeas(prev => {
      const tempIds = new Set(newIdeas.map(i => i.id));
      return prev.map(t => {
        if (tempIds.has(t.id)) {
          return saved.find(s => s.id === t.id) || t;
        }
        return t;
      });
    });
  } catch (err) {
    // 전체 롤백
    setTestIdeas(prev => 
      prev.filter(t => !newIdeas.some(n => n.id === t.id))
    );
  }
};
```

---

### 16. Undo/Redo 기능

**제안**:
```typescript
const [history, setHistory] = useState<TestIdea[][]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1);
    setTestIdeas(history[historyIndex - 1]);
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(historyIndex + 1);
    setTestIdeas(history[historyIndex + 1]);
  }
};
```

---

### 17. Progressive Web App (PWA)

**제안**:
- Service Worker로 오프라인 지원 강화
- Background Sync API로 네트워크 복구 시 자동 동기화
- Push Notifications for collaboration

---

### 18. Real-time Collaboration

**현재**: 단일 사용자 모드

**제안**:
```typescript
// Supabase Realtime 사용
useEffect(() => {
  const subscription = supabase
    .channel('test_ideas_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'test_ideas',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setTestIdeas(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTestIdeas(prev => 
            prev.map(t => t.id === payload.new.id ? payload.new : t)
          );
        } else if (payload.eventType === 'DELETE') {
          setTestIdeas(prev => prev.filter(t => t.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [user]);
```

---

## 📝 우선순위별 액션 아이템

### 🔴 즉시 수정 필요

1. **Race Condition 해결** - 동시 작업 충돌 방지
2. **임시 ID 충돌** - `crypto.randomUUID()` 사용
3. **localStorage Quota** - 초과 처리 로직 추가

### 🟡 다음 스프린트

4. **성능 최적화** - `useCallback` dependencies 수정
5. **게스트 데이터 동기화** - 병합 로직 구현
6. **네트워크 재연결** - 자동 sync
7. **Supabase getUser 캐싱**

### 🟢 백로그

8. **타입 안정성** - `any` 제거
9. **Console.log 정리**
10. **localStorage 에러 처리 개선**
11. **Error Boundary 추가**

### 💡 장기 로드맵

12. **Optimistic Update UI** - 저장 중 표시
13. **충돌 해결 전략**
14. **배치 작업**
15. **Undo/Redo**
16. **PWA 기능**
17. **Real-time Collaboration**

---

## 🎯 결론

**전체적인 코드 품질**: ⭐⭐⭐⭐ (4/5)

**강점**:
- ✅ Optimistic Update 패턴 잘 구현됨
- ✅ localStorage + Supabase 하이브리드 전략 우수
- ✅ 에러 처리 기본 골격 있음
- ✅ 타입스크립트 활용
- ✅ Service Layer 분리

**약점**:
- ❌ Race Condition 위험
- ❌ 동시성 문제 미처리
- ❌ 대용량 데이터 고려 부족
- ❌ 에러 UX 부족

**권장 사항**:
1. Critical 이슈 3개 우선 해결
2. 성능 최적화 (useCallback)
3. 에러 처리 UX 개선
4. 테스트 코드 작성 (Race Condition 검증)

이 시스템은 **프로토타입 또는 MVP로는 훌륭하지만**, 프로덕션 배포 전에 Critical 이슈들을 반드시 해결해야 합니다.




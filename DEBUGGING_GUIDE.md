# 🔍 "아이디어를 추가했는데 화면에 안 보이는" 디버깅 가이드

## 실전 문제 해결 체크리스트

---

## 1️⃣ 진짜 안 저장된 건지, 저장됐는데 "안 보여주는" 건지

### 1-1. localStorage에 실제로 들어갔는지 확인

**브라우저 DevTools에서 확인 (F12)**
```
Application → Local Storage → http://localhost:3001
```

**체크 포인트:**
- ✅ Key: `testIdeas`
- ✅ 값이 배열 형태로 있는지
- ✅ 새로 추가한 아이디어의 `name`이 있는지
- ✅ `status`, `iceScore`, `id` 등 필수 필드가 포함됐는지

**진단:**
```javascript
// localStorage에도 없다
→ useTestIdeas.addTestIdea 에서 
  localStorage.setItem 쪽 로직부터 깨진 것
  → src/hooks/useTestIdeas.ts:116-119 확인

// localStorage에는 있는데 UI에 안 나온다
→ "저장"은 됐는데 "표시 조건"에서 
  필터링/정렬에 막히는 쪽일 가능성
  → 아래 2번 항목으로
```

---

## 2️⃣ 필터/정렬에 막혀서 안 보이는 경우

### 2-1. TestIdeas 페이지 필터링

**위치:** `src/components/TestIdeas.tsx:20-31`

```typescript
const filteredIdeas = testIdeas
  .filter(idea => {
    const matchesSearch = idea.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  })
  .sort(...)
```

**체크 포인트:**

#### A. statusFilter 기본값
```typescript
// Line 16
const [statusFilter, setStatusFilter] = useState<...>('all');
```
- ✅ **현재 상태: 'all'** - 정상
- ❌ 만약 'running'이면 새 아이디어(status='planned')는 안 보임

#### B. searchQuery (검색어)
```typescript
// Line 15
const [searchQuery, setSearchQuery] = useState('');
```
- 검색 입력창에 뭔가 남아있으면 필터링됨
- **테스트 방법:** 검색창을 비우고 다시 확인

#### C. sortBy (정렬 기준)
```typescript
// Line 17
const [sortBy, setSortBy] = useState<...>('iceScore');
```
- 정렬은 "보이느냐/안 보이느냐"를 바꾸진 않음
- 하지만 ICE 점수가 낮으면 리스트 아래로 내려가서 스크롤 필요

**✅ 현재 코드: 모두 정상 설정됨**

---

## 3️⃣ Dashboard / BehavioralEconomics 특정 이슈

### 3-1. Dashboard: Top 5 제한

**위치:** `src/components/Dashboard.tsx:13-14`

```typescript
const sortedIdeas = [...testIdeas].sort((a, b) => b.iceScore - a.iceScore);
const topIdeas = sortedIdeas.slice(0, 5);
```

**증상:**
- 아이디어가 10개 있고
- 새로 추가한 아이디어의 ICE 점수가 낮으면
- → Dashboard 카드에는 안 보임
- → TestIdeas 전체 목록에는 있음

**진단 방법:**
```
1. Dashboard에서만 안 보이는지
2. TestIdeas 리스트에서도 안 보이는지

두 화면 모두 안 보임 → 상태 관리/전파 문제
TestIdeas에는 있음 → Top 5 슬라이스 때문
```

**해결:**
- Dashboard는 우선순위 높은 Top 5만 표시하는 것이 의도된 디자인
- 전체 아이디어 개수는 "총 아이디어" 카드에 표시됨

---

### 3-2. BehavioralEconomics: selectedTestId 초기화 문제 ⚠️

**문제 발견 및 수정 완료**

#### ❌ 기존 코드 (버그)
```typescript
// Line 14
const [selectedTestId, setSelectedTestId] = useState<string>(testIdeas[0]?.id || '');
```

**문제점:**
1. 첫 렌더링 때 `testIdeas`가 빈 배열
2. → `selectedTestId = ''`로 고정
3. 이후 `testIdeas`가 업데이트되어도
4. → `useState` 초기값은 다시 계산되지 않음
5. → 드롭다운 옵션은 생기지만, `value=''`라서 선택 안 된 상태
6. → 상단 카드/기회비용 계산 안 됨

#### ✅ 수정된 코드
```typescript
import { useState, useEffect } from 'react';

const [selectedTestId, setSelectedTestId] = useState<string>('');

// testIdeas가 업데이트되면 첫 번째 아이디어를 자동 선택
useEffect(() => {
  if (!selectedTestId && testIdeas.length > 0) {
    setSelectedTestId(testIdeas[0].id);
  }
}, [testIdeas, selectedTestId]);
```

**동작 방식:**
1. 초기값은 빈 문자열
2. `testIdeas`에 아이디어가 추가되면 `useEffect` 실행
3. `selectedTestId`가 비어있고 아이디어가 있으면
4. → 자동으로 첫 번째 아이디어 선택
5. → 기회비용 계산 정상 작동

---

## 4️⃣ 상태 관리 / Hook 레벨 문제

### 4-1. useTestIdeas를 여러 곳에서 호출하는 실수

**❌ 잘못된 패턴:**
```typescript
// Dashboard.tsx
const { testIdeas } = useTestIdeas();  // 인스턴스 1

// TestIdeas.tsx
const { testIdeas } = useTestIdeas();  // 인스턴스 2

// BehavioralEconomics.tsx
const { testIdeas } = useTestIdeas();  // 인스턴스 3
```
→ 페이지마다 서로 다른 state를 사용
→ ICECalculator에서 추가해도 다른 페이지는 모름

**✅ 올바른 패턴 (현재 구현):**
```typescript
// App.tsx - 단 한 곳에서만 호출
const {
  testIdeas,
  addTestIdea: addIdea,
  updateTestIdea: updateIdea,
  deleteTestIdea: deleteIdea,
  isOnline: ideasOnline
} = useTestIdeas({ language, autoLoad: true });

// 각 컴포넌트에 props로 전달
<Dashboard testIdeas={testIdeas} language={language} />
<TestIdeas testIdeas={testIdeas} onUpdate={...} onDelete={...} />
<BehavioralEconomics testIdeas={testIdeas} language={language} />
<ICECalculator onAddTestIdea={handleAddTestIdea} language={language} />
```

**확인 완료:** ✅ 현재 코드는 올바르게 구현됨

---

### 4-2. addTestIdea에서 state를 안 올려주는 경우

**체크할 위치:** `src/hooks/useTestIdeas.ts:103-145`

**필수 구조:**
```typescript
const addTestIdea = useCallback(async (idea) => {
  const newIdea = { ...idea, id: ..., iceScore: ..., createdAt: ..., status: 'planned' };
  
  // ✅ 1. localStorage 저장
  // ✅ 2. state 업데이트 (중요!)
  setTestIdeas(prev => {
    const updated = [...prev, newIdea];
    saveToLocalStorage(updated);
    return updated;  // ← 이게 있어야 화면에 반영됨
  });
  
  // ✅ 3. Supabase 저장 (옵션)
  if (isSupabaseConfigured()) {
    await testIdeasService.create(newIdea);
  }
}, [language, saveToLocalStorage]);
```

**확인 완료:** ✅ 현재 코드는 올바르게 구현됨

---

## 5️⃣ Supabase 연동 실패 시나리오

### 5-1. 환경 변수 누락

**Vercel 환경에서 확인:**
```
Settings → Environment Variables
```

**필수 변수:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**진단:**
```javascript
// src/lib/supabase/client.ts에서 확인
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
```

### 5-2. RLS 정책 문제

**증상:**
- localStorage에는 저장됨
- Network 탭에서 403/401 에러
- Supabase에는 안 들어감

**확인 방법:**
```sql
-- Supabase Dashboard → SQL Editor
SELECT * FROM test_ideas;

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'test_ideas';
```

**현재 구조:**
- Optimistic Update로 local state 먼저 반영
- Supabase 실패해도 화면은 정상 표시
- localStorage는 항상 작동

---

## 🧪 실전 디버깅 순서

### Step 1: localStorage 확인
```
F12 → Application → Local Storage
testIdeas 키에 데이터 있는지 확인
```

### Step 2: Console에서 직접 확인
```javascript
// 브라우저 콘솔에서 실행
JSON.parse(localStorage.getItem('testIdeas'))
```

### Step 3: React DevTools
```
Components → App → hooks → testIdeas
실시간으로 state 값 확인
```

### Step 4: 필터 초기화
```
- 검색창 비우기
- Status 필터를 'all'로
- 정렬을 'iceScore'로
```

### Step 5: 각 페이지별 확인
```
1. TestIdeas → 전체 목록에 있는지
2. Dashboard → Top 5 또는 통계에 반영됐는지
3. BehavioralEconomics → 드롭다운에 있는지
```

---

## 📊 코드 상태 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| localStorage 저장 | ✅ 정상 | useTestIdeas.ts:118 |
| state 업데이트 | ✅ 정상 | setTestIdeas 콜백 사용 |
| TestIdeas 필터 | ✅ 정상 | 기본값 'all' |
| Dashboard Top 5 | ✅ 정상 | 의도된 디자인 |
| BehavioralEconomics | ⚠️ 수정 | useEffect로 자동 선택 추가 |
| Hook 중복 호출 | ✅ 정상 | App.tsx에서만 호출 |
| Supabase 연동 | ✅ 정상 | 실패 시 롤백 처리 |

---

## 🎯 결론

**현재 시스템은 다음과 같이 작동합니다:**

1. ✅ ICECalculator에서 아이디어 추가
2. ✅ localStorage에 즉시 저장
3. ✅ React state 즉시 업데이트
4. ✅ 모든 컴포넌트에 자동 반영
   - Dashboard: 통계 업데이트, Top 5는 점수 순
   - TestIdeas: 전체 목록에 표시
   - BehavioralEconomics: 드롭다운에 자동 추가 및 선택

**주요 수정 사항:**
- BehavioralEconomics의 `selectedTestId` 초기화 로직 개선

**추천 디버깅 도구:**
- React DevTools
- localStorage 직접 확인
- Network 탭 (Supabase 호출 확인)





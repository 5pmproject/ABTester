# 📊 테스트 아이디어 추가 - 완전한 데이터 흐름 가이드

## 🎯 핵심 요약

**"테스트 아이디어 추가"** 버튼 클릭 시:
1. ✅ **localStorage**에 즉시 저장 (오프라인 지원 + 빠른 렌더링)
2. ✅ **Supabase `test_ideas` 테이블**에 저장 (온라인일 때)
3. ✅ **3개 페이지**에 자동 반영 (Dashboard, Test Ideas, Behavioral Economics)

---

## 🔵 1. 버튼 클릭 → 데이터 전달

### 버튼 위치
**파일**: `src/components/ICECalculator.tsx`

```html
<button type="submit" 
        class="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg">
  <svg>...</svg>
  테스트 아이디어 추가
</button>
```

### 호출 흐름
```typescript
// ICECalculator.tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  onAddTestIdea({
    name,                    // 테스트 이름
    impact,                  // 영향력 (1-10)
    confidence,              // 확신도 (1-10)
    ease,                    // 용이성 (1-10)
    currentConversionRate,   // 현재 전환율 (%)
    expectedImprovement,     // 예상 개선율 (%)
    monthlyTraffic          // 월간 트래픽
  });
};
```

---

## 🔵 2. App.tsx → useTestIdeas Hook 호출

### 위치: `src/App.tsx`

```typescript
// useTestIdeas 훅에서 함수 가져오기
const {
  testIdeas,                    // ← 모든 아이디어 배열
  addTestIdea: addIdea,         // ← 추가 함수
  updateTestIdea: updateIdea,
  deleteTestIdea: deleteIdea,
  isOnline: ideasOnline
} = useTestIdeas({ language, autoLoad: true });

// ICECalculator로부터 받은 데이터를 처리
const handleAddTestIdea = async (idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>) => {
  try {
    await addIdea(idea);  // ← 여기서 실제 저장 발생
  } catch (error) {
    console.error('Failed to add test idea:', error);
  }
};
```

---

## 🔵 3. 최종 저장 위치 (2단계 저장)

### ✔ 1단계: localStorage 저장 (즉시)

**파일**: `src/hooks/useTestIdeas.ts:116-120`

```typescript
// Optimistic Update (낙관적 업데이트)
setTestIdeas(prev => {
  const updated = [...prev, newIdea];
  saveToLocalStorage(updated);  // ← localStorage에 즉시 저장
  return updated;                // ← state 업데이트 → 화면 즉시 반영
});
```

**저장 키**: `testIdeas`

**저장 형식**:
```json
[
  {
    "id": "temp-1732896543210",
    "name": "결제 페이지 CTA 색상 변경",
    "impact": 8,
    "confidence": 7,
    "ease": 6,
    "iceScore": 336,
    "currentConversionRate": 3,
    "expectedImprovement": 15,
    "monthlyTraffic": 50000,
    "status": "planned",
    "createdAt": "2025-11-29T12:34:56.789Z"
  },
  {
    "id": "temp-1732896789012",
    "name": "프로모션 배너 추가",
    "impact": 7,
    "confidence": 8,
    "ease": 9,
    "iceScore": 504,
    "currentConversionRate": 2.5,
    "expectedImprovement": 20,
    "monthlyTraffic": 80000,
    "status": "planned",
    "createdAt": "2025-11-29T13:45:12.345Z"
  }
]
```

**목적**:
- 🚀 **즉각적인 UI 반영** (Optimistic Update)
- 📱 **오프라인 지원** (인터넷 없어도 작동)
- ⚡ **빠른 로딩** (페이지 새로고침 시 Supabase 기다릴 필요 없음)

---

### ✔ 2단계: Supabase DB 저장 (온라인일 때)

**파일**: `src/hooks/useTestIdeas.ts:122-133`

```typescript
// Supabase 설정이 되어 있으면
if (!isSupabaseConfigured()) {
  return; // localStorage만 사용
}

try {
  const savedIdea = await testIdeasService.create(newIdea);
  // 임시 ID를 실제 Supabase ID로 교체
  setTestIdeas(prev => {
    const updated = prev.map(t => t.id === newIdea.id ? savedIdea : t);
    saveToLocalStorage(updated);
    return updated;
  });
} catch (err) {
  // 에러 발생 시 롤백
  setTestIdeas(prev => prev.filter(t => t.id !== newIdea.id));
}
```

---

## 📌 Supabase 테이블 스키마

### 테이블명: `test_ideas`

| 컬럼 | 타입 | 설명 | 제약 조건 |
|------|------|------|-----------|
| `id` | UUID | 고유 식별자 | PRIMARY KEY |
| `user_id` | UUID | 사용자 ID | FOREIGN KEY → profiles(id) |
| `name` | TEXT | 테스트 이름 | NOT NULL |
| `impact` | INTEGER | 영향력 (1-10) | CHECK (1-10) |
| `confidence` | INTEGER | 확신도 (1-10) | CHECK (1-10) |
| `ease` | INTEGER | 용이성 (1-10) | CHECK (1-10) |
| `ice_score` | INTEGER | ICE 점수 | 자동 계산 (trigger) |
| `current_conversion_rate` | NUMERIC(6,2) | 현재 전환율 (%) | NOT NULL |
| `expected_improvement` | NUMERIC(6,2) | 예상 개선율 (%) | NOT NULL |
| `monthly_traffic` | INTEGER | 월간 트래픽 | NOT NULL |
| `status` | TEXT | 상태 | planned/running/completed |
| `test_duration` | INTEGER | 테스트 기간 (일) | NULLABLE |
| `actual_result` | NUMERIC(6,2) | 실제 결과 (%) | NULLABLE |
| `created_at` | TIMESTAMPTZ | 생성 시간 | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | 수정 시간 | 자동 업데이트 (trigger) |

### 자동 계산 Trigger
```sql
-- ICE Score = Impact × Confidence × Ease
CREATE TRIGGER set_ice_score
  BEFORE INSERT OR UPDATE OF impact, confidence, ease 
  ON test_ideas
  FOR EACH ROW
  EXECUTE FUNCTION calculate_ice_score();
```

---

## 🔵 4. 데이터가 흐르는 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 액션                               │
│     ICECalculator.tsx - "테스트 아이디어 추가" 버튼 클릭      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  onAddTestIdea() 호출                        │
│  { name, impact, confidence, ease, ... }                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              App.tsx - handleAddTestIdea()                   │
│           useTestIdeas().addTestIdea() 호출                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          useTestIdeas Hook - addTestIdea()                   │
│                                                              │
│  1. newIdea 객체 생성 (id, iceScore, status 추가)            │
│  2. setTestIdeas() → localStorage 저장 (즉시)                │
│  3. Supabase test_ideas 테이블에 저장 (온라인일 때)           │
│  4. 성공 시: 임시 ID를 실제 ID로 교체                         │
│     실패 시: 롤백 (localStorage에서도 제거)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            React가 testIdeas state 변화 감지                 │
│                   자동 리렌더링 트리거                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               3개 페이지 자동 업데이트                        │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Dashboard                                        │      │
│  │  - Top 5 우선순위 아이디어 (ICE 점수 순)           │      │
│  │  - 총 아이디어 개수                                │      │
│  │  - 상태별 파이 차트                                │      │
│  │  - ICE 점수 분포 막대 그래프                        │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Test Ideas                                       │      │
│  │  - 전체 아이디어 리스트                            │      │
│  │  - 검색/필터/정렬 기능                             │      │
│  │  - 상태 변경 버튼                                  │      │
│  │  - 편집/삭제 버튼                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Behavioral Economics                             │      │
│  │  - 드롭다운에 아이디어 목록 표시                    │      │
│  │  - 선택한 아이디어의 기회비용 계산                  │      │
│  │  - Cialdini 설득 원리 적용 가이드                  │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🍃 5. 정상 동작 체크리스트

### ✅ ICE 계산기에서 추가 시

- [ ] 폼에 데이터 입력
- [ ] "테스트 아이디어 추가" 버튼 클릭
- [ ] "아이디어가 추가되었습니다" 알림 표시
- [ ] 폼 필드 초기화

### ✅ localStorage 확인

- [ ] F12 → Application → Local Storage
- [ ] `testIdeas` 키에 새 아이디어가 배열로 저장됨
- [ ] 필수 필드 확인: `id`, `name`, `iceScore`, `status`, `createdAt`

### ✅ Dashboard 페이지

- [ ] 총 아이디어 개수 +1
- [ ] ICE 점수가 높으면 Top 5에 표시
- [ ] 상태별 파이 차트 업데이트 (Planned +1)
- [ ] ICE 점수 분포 그래프 업데이트

### ✅ Test Ideas 페이지

- [ ] 전체 리스트에 새 아이디어 표시
- [ ] ICE 점수 순으로 정렬됨
- [ ] 검색/필터로 찾을 수 있음
- [ ] 상태: "Planned" 배지 표시

### ✅ Behavioral Economics 페이지

- [ ] 드롭다운에 새 아이디어 표시
- [ ] 자동으로 선택됨 (첫 번째 아이디어가 없었다면)
- [ ] 기회비용 계산 가능

### ✅ 페이지 새로고침 후

- [ ] localStorage에서 데이터 로드
- [ ] 추가한 아이디어가 그대로 유지됨
- [ ] 3개 페이지 모두에서 확인 가능

---

## 🔍 저장 확인 방법

### 방법 1: localStorage 확인

```javascript
// 브라우저 콘솔에서 실행
JSON.parse(localStorage.getItem('testIdeas'))
```

**또는**

```
F12 → Application → Local Storage → http://localhost:3001
→ testIdeas 클릭
```

### 방법 2: Supabase 확인

```
Supabase Dashboard 
→ Table Editor 
→ test_ideas
→ 최신 레코드 확인
```

### 방법 3: React DevTools

```
Components 탭
→ App
→ hooks
→ testIdeas (배열 확인)
```

---

## 🚨 트러블슈팅

### 문제: localStorage에는 있는데 화면에 안 보임

**원인**: 필터링/정렬 문제
- TestIdeas: `statusFilter`가 'all'인지 확인
- Dashboard: ICE 점수가 낮아서 Top 5 밖일 수 있음
- BehavioralEconomics: `selectedTestId`가 빈 문자열일 수 있음

### 문제: localStorage에도 없음

**원인**: `useTestIdeas.addTestIdea` 로직 오류
- `setTestIdeas` 호출 확인
- `saveToLocalStorage` 호출 확인
- 콘솔 에러 확인

### 문제: Supabase에는 안 들어감

**원인**: 환경 변수 또는 RLS 정책
- `VITE_SUPABASE_URL` 확인
- `VITE_SUPABASE_ANON_KEY` 확인
- Network 탭에서 403/401 에러 확인
- RLS 정책 확인

---

## 💡 핵심 포인트

1. **하나의 state**가 모든 것을 관리
   - `App.tsx`의 `testIdeas` state
   - 이게 바뀌면 3개 페이지 자동 리렌더링

2. **Optimistic Update**
   - localStorage 먼저 저장 → 화면 즉시 반영
   - Supabase는 백그라운드에서 저장
   - 실패하면 롤백

3. **단일 진실 공급원 (Single Source of Truth)**
   - 각 페이지는 `useTestIdeas`를 직접 호출하지 않음
   - `App.tsx`에서 한 번만 호출
   - Props로 전달받아 사용

4. **2단계 저장 전략**
   - localStorage: 오프라인 + 빠른 로딩
   - Supabase: 영구 저장 + 다중 기기 동기화

---

## 📁 관련 파일 위치

| 파일 | 역할 |
|------|------|
| `src/components/ICECalculator.tsx` | 버튼 및 폼 |
| `src/App.tsx` | 라우팅 및 state 관리 |
| `src/hooks/useTestIdeas.ts` | 저장 로직 |
| `src/services/test-ideas.service.ts` | Supabase API |
| `src/components/Dashboard.tsx` | 대시보드 표시 |
| `src/components/TestIdeas.tsx` | 리스트 표시 |
| `src/components/BehavioralEconomics.tsx` | 기회비용 계산 |
| `supabase/schema.sql` | DB 스키마 |

---

## 🎯 결론

**"테스트 아이디어 추가"** 버튼은:
- ✅ **하나의 테이블**에만 저장 (`test_ideas`)
- ✅ **동시에 localStorage**에도 저장
- ✅ **3개 페이지**에 자동 반영
- ✅ **Optimistic Update**로 즉각 반응
- ✅ **에러 시 롤백**으로 일관성 유지

이 모든 것이 **`testIdeas` state** 하나로 연결되어 있습니다! 🚀


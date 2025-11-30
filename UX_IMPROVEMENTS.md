# 🎯 UX 개선사항 및 주의점

## 📌 핵심 변경사항 (2025-11-30)

### ✅ 해결된 문제: Supabase 실패 시 데이터 롤백

**이전 동작:**
- Supabase 저장 실패 시 → 낙관적 업데이트(Optimistic Update) 롤백
- 사용자가 추가한 아이디어가 화면에서 사라짐
- "추가했는데 다른 페이지에 반영 안 됨" 느낌

**개선된 동작:**
- Supabase 저장 실패해도 → 로컬에는 데이터 유지
- `synced: false` 플래그로 동기화 상태 추적
- 사용자에게 "로컬만" 배지 표시
- 나중에 재시도 가능한 구조

---

## 🔍 사용자가 "반영 안 됨"이라고 느낄 수 있는 상황들

### 1️⃣ Dashboard에서 안 보이는 경우

**원인**: Dashboard는 **Top 5**만 표시

```typescript
const sortedIdeas = [...testIdeas].sort((a, b) => b.iceScore - a.iceScore);
const topIdeas = sortedIdeas.slice(0, 5); // ← Top 5만!
```

**해결 방법:**
- ICE 점수가 낮은 아이디어는 Top 5에 포함되지 않을 수 있음
- "테스트 아이디어 관리" 탭에서 전체 리스트 확인
- ICE 점수를 높여서 추가하면 Dashboard에 표시됨

---

### 2️⃣ TestIdeas에서 안 보이는 경우

**원인**: 필터/검색 적용됨

```typescript
const filteredIdeas = testIdeas
  .filter(idea => {
    const matchesSearch = idea.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  })
```

**체크 포인트:**
- ✅ **검색창이 비어있는지** 확인
- ✅ **상태 필터가 "전체"로 설정되어 있는지** 확인
  - 새로 추가된 아이디어는 항상 `status: 'planned'`
  - 필터가 'running' or 'completed'면 안 보임

---

### 3️⃣ BehavioralEconomics에서 안 보이는 경우

**원인**: 선택된 테스트만 표시하는 구조

```typescript
const [selectedTestId, setSelectedTestId] = useState<string>('');
const selectedTest = testIdeas.find(test => test.id === selectedTestId);
```

**동작 방식:**
- 드롭다운에는 새 아이디어가 자동으로 추가됨
- 하지만 **선택은 자동으로 바뀌지 않음**
- 상단 메트릭/그래프는 선택된 테스트 기준

**해결 방법:**
- 드롭다운을 열어서 새 아이디어 직접 선택

---

## 🛠️ 기술적 개선사항

### 1. TestIdea 타입에 `synced` 필드 추가

```typescript
export type TestIdea = {
  // ... 기존 필드들
  synced?: boolean; // Supabase와 동기화 여부 (로컬 전용 필드)
};
```

### 2. addTestIdea - 로컬 우선 전략

**Before:**
```typescript
} catch (err) {
  // ❌ 롤백 - 아이디어 삭제
  setTestIdeas(prev => prev.filter(t => t.id !== newIdea.id));
}
```

**After:**
```typescript
} catch (err) {
  // ✅ 로컬 유지 - synced: false로 표시
  setTestIdeas(prev => 
    prev.map(t => t.id === newIdea.id ? { ...t, synced: false } : t)
  );
}
```

### 3. updateTestIdea - 업데이트는 유지

```typescript
} catch (err) {
  // ✅ 업데이트는 로컬에 유지, synced만 false로 표시
  setTestIdeas(prev => 
    prev.map(t => t.id === id ? { ...t, synced: false } : t)
  );
}
```

### 4. deleteTestIdea - 삭제는 민감하므로 복원

```typescript
} catch (err) {
  // ✅ 삭제 실패 시 복원 (삭제는 민감한 작업)
  if (deletedIdea) {
    setTestIdeas(prev => [...prev, { ...deletedIdea, synced: false }]);
  }
  alert('⚠️ 서버 삭제 실패: 로컬에서만 삭제되었습니다.');
}
```

### 5. 사용자 피드백 개선

**ICECalculator.tsx:**
```typescript
alert(
  `✅ "${name}" 아이디어가 추가되었습니다!\n\n` +
  `💡 팁: "테스트 아이디어 관리" 탭에서 전체 목록을 확인할 수 있습니다.`
);
```

**TestIdeas.tsx:**
- `synced: false`인 아이디어에 "로컬만" 배지 표시
- CloudOff 아이콘으로 시각적 표시

---

## 🎯 사용자 가이드

### 아이디어를 추가했는데 안 보이는 것 같다면?

1. **TestIdeas 탭 확인**
   - 검색창 비우기
   - 상태 필터를 "전체"로 변경
   - 맨 아래까지 스크롤해서 확인

2. **Dashboard 확인**
   - Top 5에만 표시됨
   - ICE 점수가 높은 5개만 보임
   - TestIdeas에서 전체 리스트 확인 권장

3. **BehavioralEconomics 확인**
   - 드롭다운에서 직접 선택 필요
   - 선택하면 메트릭/그래프가 해당 아이디어 기준으로 변경

4. **동기화 상태 확인**
   - "로컬만" 배지가 있다면 서버 저장 실패
   - 데이터는 localStorage에 안전하게 저장됨
   - 인터넷 연결 후 재시도 가능

---

## 🔧 디버깅 체크리스트

### Supabase 에러 확인

1. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - `[TestIdeasService]` 에러 로그 확인

2. **Network 탭 확인**
   - F12 → Network 탭
   - Supabase API 호출 실패 (403/401) 확인

3. **localStorage 확인**
   - F12 → Application → Local Storage
   - `testIdeas` 키에 데이터가 있는지 확인

### 일반적인 문제 해결

| 증상 | 가능한 원인 | 해결 방법 |
|------|-------------|-----------|
| 추가했는데 바로 사라짐 | Supabase RLS 정책 문제 | 콘솔 에러 확인, RLS 정책 점검 |
| Dashboard에만 안 보임 | ICE 점수가 낮음 | TestIdeas에서 확인, 점수 높여서 재추가 |
| TestIdeas에서 안 보임 | 필터/검색 적용됨 | 필터 "전체", 검색창 비우기 |
| Behavioral에서 안 보임 | 다른 테스트 선택됨 | 드롭다운에서 직접 선택 |

---

## 📚 관련 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.tsx` | TestIdea 타입에 `synced?` 필드 추가 |
| `src/hooks/useTestIdeas.ts` | 롤백 로직 제거, synced 플래그 관리 |
| `src/components/ICECalculator.tsx` | 사용자 피드백 메시지 개선 |
| `src/components/TestIdeas.tsx` | "로컬만" 배지 표시 (synced: false일 때) |

---

## 🚀 향후 개선 가능 사항

1. **자동 재동기화**
   - 온라인 복귀 시 `synced: false` 항목 자동 재시도
   - Service Worker로 백그라운드 동기화

2. **Conflict Resolution**
   - 여러 기기에서 동시 편집 시 충돌 해결
   - Last-Write-Wins 또는 Manual Merge

3. **Sync Status Indicator**
   - 헤더에 전체 동기화 상태 표시
   - "N개 항목 동기화 대기 중" 메시지

4. **Offline Mode Banner**
   - 오프라인일 때 상단에 알림 배너
   - "오프라인 모드: 변경사항은 로컬에만 저장됩니다"

---

## ✅ 결론

**핵심 개선:**
- ✅ Supabase 실패해도 로컬 데이터 유지
- ✅ 사용자에게 명확한 피드백 제공
- ✅ 동기화 상태 시각적 표시
- ✅ 오프라인 우선(Offline-First) 앱으로 진화

**사용자 경험:**
- "추가했는데 사라짐" → "로컬에 안전하게 저장됨"
- "다른 페이지에 안 보임" → "필터/Top5 확인"
- "어디 갔는지 모름" → "전체 목록에서 검색"


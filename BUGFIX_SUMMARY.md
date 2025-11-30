# 🐛 버그 수정 및 UX 개선 요약

## 📅 날짜: 2025-11-30

---

## 🎯 핵심 문제 및 해결

### 🔴 **진짜 버그**: Supabase 실패 시 데이터 롤백

#### 문제 상황
```typescript
// 이전 코드 (문제)
} catch (err) {
  // ❌ 롤백: 새 아이디어를 완전히 삭제
  setTestIdeas(prev => prev.filter(t => t.id !== newIdea.id));
  saveToLocalStorage(updated);
}
```

**증상:**
1. 사용자가 ICECalculator에서 "테스트 아이디어 추가" 클릭
2. 화면에 잠깐 나타났다가 사라짐 (Supabase 에러로 인한 롤백)
3. Dashboard, TestIdeas, BehavioralEconomics 어디에도 안 나타남
4. **"추가했는데 다른 페이지에 반영 안 됨"** 느낌

#### 해결 방법
```typescript
// 수정된 코드 (해결)
} catch (err) {
  // ✅ 로컬 유지: synced: false로 표시만
  setTestIdeas(prev => 
    prev.map(t => t.id === newIdea.id ? { ...t, synced: false } : t)
  );
  saveToLocalStorage(updated);
}
```

**개선점:**
- ✅ **로컬 데이터는 항상 유지**
- ✅ `synced: false` 플래그로 동기화 상태 추적
- ✅ 사용자에게 "로컬만" 배지 표시
- ✅ 나중에 재동기화 가능

---

## 🟡 **UX 혼란**: 필터/Top5로 인한 "안 보임" 착각

### 1. Dashboard - Top 5만 표시

```typescript
const topIdeas = sortedIdeas.slice(0, 5); // ← Top 5만!
```

**증상:**
- ICE 점수가 낮은 아이디어는 Dashboard에서 안 보임

**해결:**
- 설계상 의도된 동작 (버그 아님)
- TestIdeas 탭에서 전체 리스트 확인 가능
- 사용자 피드백 개선: "💡 팁: '테스트 아이디어 관리' 탭에서 전체 목록 확인"

### 2. TestIdeas - 필터/검색으로 숨김

```typescript
const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
```

**증상:**
- 상태 필터가 'running'/'completed'면 새 아이디어(planned) 안 보임
- 검색창에 텍스트 있으면 매칭 안 되는 아이디어 숨김

**해결:**
- 설계상 의도된 동작 (버그 아님)
- 사용자 확인: 필터 "전체", 검색창 비우기

### 3. BehavioralEconomics - 선택된 테스트만 표시

```typescript
const selectedTest = testIdeas.find(test => test.id === selectedTestId);
```

**증상:**
- 드롭다운에는 추가되지만, 자동으로 선택되지 않음
- 이전 선택된 테스트 기준으로만 메트릭 표시

**해결:**
- 설계상 의도된 동작 (버그 아님)
- 사용자가 드롭다운에서 직접 선택 필요

---

## 📝 변경된 파일 목록

### 1. `src/App.tsx`
**변경 내용:**
- `TestIdea` 타입에 `synced?: boolean` 필드 추가

```typescript
export type TestIdea = {
  // ... 기존 필드들
  synced?: boolean; // Supabase와 동기화 여부
};
```

### 2. `src/hooks/useTestIdeas.ts`
**변경 내용:**
- `addTestIdea`: 롤백 제거, synced 플래그 관리
- `updateTestIdea`: 업데이트는 로컬 유지, synced만 false
- `deleteTestIdea`: 삭제 실패 시 복원 (민감한 작업)

**주요 로직:**
```typescript
// 추가
try {
  const savedIdea = await testIdeasService.create(newIdea);
  setTestIdeas(prev => prev.map(t => 
    t.id === newIdea.id ? { ...savedIdea, synced: true } : t
  ));
} catch (err) {
  // ✅ 롤백 안 함, synced: false만 표시
  setTestIdeas(prev => prev.map(t => 
    t.id === newIdea.id ? { ...t, synced: false } : t
  ));
}
```

### 3. `src/components/ICECalculator.tsx`
**변경 내용:**
- 추가 성공 시 명확한 피드백 메시지

```typescript
alert(
  `✅ "${name}" 아이디어가 추가되었습니다!\n\n` +
  `💡 팁: "테스트 아이디어 관리" 탭에서 전체 목록을 확인할 수 있습니다.`
);
```

### 4. `src/components/TestIdeas.tsx`
**변경 내용:**
- `CloudOff` 아이콘 import
- `synced: false`인 아이디어에 "로컬만" 배지 표시

```typescript
{idea.synced === false && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
    <CloudOff className="w-3 h-3" />
    {language === 'ko' ? '로컬만' : 'Local only'}
  </span>
)}
```

---

## 🎨 UI/UX 개선사항

### Before vs After

| 항목 | Before | After |
|------|--------|-------|
| Supabase 실패 시 | 데이터 사라짐 ❌ | 로컬 유지 + "로컬만" 배지 ✅ |
| 추가 성공 피드백 | 없음 | "✅ 추가됨 + 💡 전체 목록 확인 팁" ✅ |
| 동기화 상태 | 보이지 않음 | "로컬만" 배지로 시각화 ✅ |
| 에러 발생 시 | 조용히 사라짐 ❌ | 콘솔 로그 + 사용자 알림 ✅ |

---

## 🧪 테스트 시나리오

### 1. 정상 동작 (Supabase 연결됨)
1. ICECalculator에서 아이디어 추가
2. ✅ "추가되었습니다" 알림 표시
3. ✅ TestIdeas 탭에서 확인 가능
4. ✅ Dashboard Top 5에 표시 (ICE 점수 높으면)
5. ✅ BehavioralEconomics 드롭다운에 추가됨
6. ✅ "로컬만" 배지 없음 (synced: true)

### 2. Supabase 에러 발생
1. ICECalculator에서 아이디어 추가
2. ✅ "추가되었습니다" 알림 표시
3. ✅ TestIdeas 탭에서 확인 가능
4. ✅ **"로컬만" 배지 표시** (synced: false)
5. ✅ localStorage에 저장되어 새로고침 후에도 유지
6. ✅ 콘솔에 "서버 저장 실패" 경고 로그

### 3. 오프라인 모드
1. ICECalculator에서 아이디어 추가
2. ✅ localStorage에만 저장 (synced: true로 간주)
3. ✅ 모든 페이지에서 정상 표시
4. ✅ 온라인 복귀 시 재동기화 가능 (향후 구현)

---

## 📊 영향 범위

### 데이터 흐름
```
[ICECalculator] → [App.handleAddTestIdea] → [useTestIdeas.addTestIdea]
                                                      ↓
                                        ┌─────────────┴─────────────┐
                                        ↓                           ↓
                              [localStorage 저장]          [Supabase 저장 시도]
                                   (즉시, 무조건)              (비동기, 실패 가능)
                                        ↓                           ↓
                                  synced: false            성공: synced: true
                                                          실패: synced: false 유지
                                        ↓
                              ┌─────────┴─────────┬──────────────────┐
                              ↓                   ↓                  ↓
                        [Dashboard]         [TestIdeas]    [BehavioralEconomics]
                        Top 5만 표시        전체 리스트         드롭다운 추가
```

### 영향받는 컴포넌트
- ✅ **ICECalculator**: 피드백 메시지 개선
- ✅ **TestIdeas**: 동기화 상태 배지 표시
- ✅ **Dashboard**: 변경 없음 (props로 받은 testIdeas만 표시)
- ✅ **BehavioralEconomics**: 변경 없음 (props로 받은 testIdeas만 표시)

---

## 🚀 배포 전 체크리스트

- [x] TypeScript 컴파일 에러 없음
- [x] Linter 에러 없음
- [x] 기존 기능 정상 동작
- [x] 새 기능 (synced 플래그) 정상 동작
- [x] localStorage 읽기/쓰기 정상
- [x] Supabase 정상 연결 시 동작 확인
- [x] Supabase 에러 시 동작 확인
- [x] 오프라인 모드 동작 확인
- [x] 문서 작성 (UX_IMPROVEMENTS.md)

---

## 📚 관련 문서

1. **`DATA_FLOW_COMPLETE.md`**: 전체 데이터 흐름 설명
2. **`UX_IMPROVEMENTS.md`**: 상세 UX 개선사항 및 주의점 (신규)
3. **`CODE_REVIEW.md`**: 이전 코드 리뷰 기록

---

## 💡 향후 개선 가능 사항

1. **자동 재동기화**
   ```typescript
   // 온라인 복귀 시 synced: false 항목 자동 재시도
   window.addEventListener('online', () => {
     resyncUnsyncedItems();
   });
   ```

2. **Sync Queue**
   ```typescript
   // 실패한 작업을 큐에 저장하고 순차적으로 재시도
   const syncQueue = loadSyncQueue();
   syncQueue.forEach(item => retrySync(item));
   ```

3. **Conflict Resolution**
   - 여러 기기에서 동시 편집 시 충돌 해결
   - Last-Write-Wins 또는 Manual Merge

4. **Background Sync (Service Worker)**
   ```javascript
   // 백그라운드에서 자동 동기화
   self.addEventListener('sync', event => {
     if (event.tag === 'test-ideas-sync') {
       event.waitUntil(syncTestIdeas());
     }
   });
   ```

---

## ✅ 결론

### 핵심 성과
1. ✅ **진짜 버그 수정**: Supabase 실패 시 데이터 유지
2. ✅ **UX 개선**: 명확한 피드백 및 상태 표시
3. ✅ **오프라인 우선**: 로컬 데이터 최우선 전략
4. ✅ **확장 가능**: 향후 자동 재동기화 기반 마련

### 사용자 경험 개선
- **Before**: "추가했는데 사라짐" 😰
- **After**: "로컬에 안전하게 저장됨 + 동기화 상태 표시" 😊

### 기술적 품질 향상
- Optimistic Update 제대로 구현 ✅
- Offline-First 앱으로 진화 ✅
- 에러 처리 개선 (로그 + 알림) ✅
- 확장성 확보 (synced 플래그) ✅


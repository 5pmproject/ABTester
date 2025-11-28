# 🚀 ABTester - Supabase 백엔드 설정 가이드

이 가이드는 ABTester 프로젝트에 Supabase 백엔드를 연동하는 방법을 단계별로 설명합니다.

---

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 실행](#2-데이터베이스-스키마-실행)
3. [환경변수 설정](#3-환경변수-설정)
4. [App.tsx 통합](#4-apptsx-통합)
5. [테스트 및 확인](#5-테스트-및-확인)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 가입 및 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: ABTester
   - **Database Password**: 안전한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul)
   - **Pricing Plan**: Free

### 1.2 API 키 확인

1. Supabase 대시보드에서 프로젝트 선택
2. 좌측 메뉴에서 `Settings` > `API` 클릭
3. 다음 정보 복사:
   - **Project URL** (예: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (공개 키)

---

## 2. 데이터베이스 스키마 실행

### 2.1 SQL Editor 접속

1. Supabase 대시보드 좌측 메뉴에서 `SQL Editor` 클릭
2. "New query" 버튼 클릭

### 2.2 스키마 실행

1. `supabase/schema.sql` 파일 열기
2. 전체 내용 복사
3. SQL Editor에 붙여넣기
4. `Run` 버튼 클릭 (또는 Ctrl/Cmd + Enter)

### 2.3 실행 결과 확인

성공 시 다음 메시지 표시:
```
Success. No rows returned
```

테이블 확인:
1. 좌측 메뉴에서 `Table Editor` 클릭
2. `profiles`, `test_ideas` 테이블이 생성되었는지 확인

---

## 3. 환경변수 설정

### 3.1 .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일 생성:

```bash
# Windows
New-Item .env

# Mac/Linux
touch .env
```

### 3.2 환경변수 작성

`.env` 파일에 다음 내용 입력:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**주의**: 
- `your-project-id`와 `your-anon-key-here`를 실제 값으로 교체
- `.env` 파일은 절대 Git에 커밋하지 마세요!
- `.gitignore`에 `.env`가 포함되어 있는지 확인

### 3.3 환경변수 확인

개발 서버 재시작 후 콘솔 확인:

```bash
npm run dev
```

환경변수가 올바르게 설정되었다면 경고 메시지가 나타나지 않습니다.

---

## 4. App.tsx 통합

현재 `App.tsx`는 `useState`로 로컬 상태 관리를 하고 있습니다. 이를 Supabase 연동 Hooks로 교체합니다.

### 4.1 기존 코드 백업

```bash
# App.tsx 백업
cp src/App.tsx src/App.tsx.backup
```

### 4.2 Imports 추가

`src/App.tsx` 파일 상단에 추가:

```typescript
import { useTestIdeas } from './hooks/useTestIdeas';
import { useAuth } from './hooks/useAuth';
```

### 4.3 useState를 Hooks로 교체

**기존 코드 (삭제):**
```typescript
const [user, setUser] = useState<User>(null);
const [testIdeas, setTestIdeas] = useState<TestIdea[]>(getMockTestIdeas('ko'));
```

**새 코드 (추가):**
```typescript
const { 
  user, 
  loading: authLoading, 
  signIn: authSignIn, 
  signUp: authSignUp, 
  signOut: authSignOut,
  isOnline: authOnline 
} = useAuth({ language });

const {
  testIdeas,
  loading: ideasLoading,
  error: ideasError,
  addTestIdea: addIdea,
  updateTestIdea: updateIdea,
  deleteTestIdea: deleteIdea,
  isOnline: ideasOnline
} = useTestIdeas({ language });
```

### 4.4 함수 수정

**addTestIdea 함수:**
```typescript
// 기존 코드 삭제
const addTestIdea = (idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>) => {
  // ... 로컬 상태 업데이트 로직
};

// 새 코드는 이미 useTestIdeas에서 제공됨
// addIdea 함수를 그대로 사용하면 됨
```

**handleLogin 함수:**
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    await authSignIn(email, password);
    setShowAuthModal(false);
  } catch (error) {
    alert(language === 'ko' 
      ? '로그인에 실패했습니다' 
      : 'Login failed'
    );
  }
};
```

**handleSignup 함수:**
```typescript
const handleSignup = async (name: string, email: string, password: string, company: string) => {
  try {
    await authSignUp(email, password, name, company);
    setShowAuthModal(false);
  } catch (error) {
    alert(language === 'ko' 
      ? '회원가입에 실패했습니다' 
      : 'Signup failed'
    );
  }
};
```

**handleLogout 함수:**
```typescript
const handleLogout = async () => {
  if (hasUnsavedChanges) {
    const confirmed = window.confirm(
      language === 'ko' 
        ? '저장하지 않은 변경사항이 있습니다. 로그아웃하시겠습니까?' 
        : 'You have unsaved changes. Do you want to logout?'
    );
    if (!confirmed) return;
  }
  
  try {
    await authSignOut();
    setHasUnsavedChanges(false);
  } catch (error) {
    alert(language === 'ko' 
      ? '로그아웃에 실패했습니다' 
      : 'Logout failed'
    );
  }
};
```

### 4.5 ICECalculator에 함수 전달

```typescript
<ICECalculator onAddTestIdea={addIdea} language={language} />
```

### 4.6 TestIdeas에 함수 전달

```typescript
<TestIdeas 
  testIdeas={testIdeas}
  onUpdate={updateIdea}
  onDelete={deleteIdea}
  language={language}
/>
```

### 4.7 온라인/오프라인 상태 표시 (선택사항)

Header에 온라인 상태 표시 추가:

```typescript
{!ideasOnline && (
  <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1">
    <span className="text-yellow-800 text-sm">
      {language === 'ko' ? '오프라인 모드' : 'Offline Mode'}
    </span>
  </div>
)}
```

---

## 5. 테스트 및 확인

### 5.1 기본 동작 테스트

1. **회원가입 테스트**
   ```
   - 헤더의 게스트 버튼 클릭
   - 회원가입 탭 선택
   - 정보 입력 후 가입
   - 이메일 인증 메일 확인
   ```

2. **로그인 테스트**
   ```
   - 로그아웃 후 다시 로그인
   - 프로필 정보가 표시되는지 확인
   ```

3. **테스트 아이디어 CRUD**
   ```
   - ICE Calculator에서 새 아이디어 추가
   - Test Ideas 페이지에서 상태 변경
   - 아이디어 수정 및 삭제
   - 새로고침 후 데이터 유지 확인
   ```

### 5.2 Supabase 대시보드 확인

1. `Table Editor` > `test_ideas` 테이블
2. 추가한 데이터가 표시되는지 확인
3. RLS 정책 작동 확인 (다른 사용자 데이터는 안 보임)

### 5.3 오프라인 모드 테스트

1. 브라우저 개발자 도구 열기 (F12)
2. `Network` 탭에서 `Offline` 체크
3. 앱이 localStorage 데이터로 작동하는지 확인
4. 온라인 복귀 시 자동 동기화 확인

---

## 6. 트러블슈팅

### 문제 1: "Supabase credentials not found" 경고

**원인**: `.env` 파일이 없거나 환경변수가 잘못됨

**해결**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 변수명이 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`인지 확인
3. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 문제 2: "Failed to fetch" 에러

**원인**: Supabase URL이 잘못되었거나 네트워크 문제

**해결**:
1. Supabase 대시보드에서 URL 다시 확인
2. 브라우저 콘솔에서 네트워크 오류 확인
3. Supabase 프로젝트가 일시 중지되지 않았는지 확인

### 문제 3: "Row Level Security policy violation"

**원인**: RLS 정책이 올바르게 설정되지 않음

**해결**:
1. SQL Editor에서 `schema.sql` 재실행
2. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'test_ideas';
   ```
3. 사용자가 로그인되어 있는지 확인

### 문제 4: 데이터가 저장되지 않음

**원인**: 인증되지 않은 상태에서 데이터 추가 시도

**해결**:
1. 로그인 상태 확인
2. 콘솔에서 에러 메시지 확인
3. `user_id` 컬럼이 현재 사용자 ID로 설정되는지 확인

### 문제 5: TypeScript 에러

**원인**: 타입 정의가 맞지 않음

**해결**:
```bash
# TypeScript 컴파일 확인
npm run lint

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 완료!

축하합니다! ABTester가 이제 Supabase 백엔드와 연동되었습니다.

### 다음 단계

- [ ] 이메일 인증 설정 (Supabase > Authentication > Email Templates)
- [ ] 프로덕션 배포 (Vercel, Netlify 등)
- [ ] 도메인 설정
- [ ] Supabase Realtime 연동 (선택사항)
- [ ] 에러 트래킹 (Sentry 등)

### 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [React + Supabase 튜토리얼](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📝 참고: 기존 localStorage 데이터 마이그레이션

기존에 localStorage에 저장된 테스트 아이디어를 Supabase로 마이그레이션하려면:

```typescript
// 브라우저 콘솔에서 실행
const localIdeas = JSON.parse(localStorage.getItem('testIdeas') || '[]');
console.log('마이그레이션할 아이디어:', localIdeas.length);

// 각 아이디어를 Supabase에 저장
for (const idea of localIdeas) {
  await testIdeasService.create(idea);
}

console.log('마이그레이션 완료!');
```

---

**문제가 발생하면 이슈를 등록해주세요!**


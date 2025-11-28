-- ============================================
-- ABTester - Database Schema
-- A/B Testing Platform with ICE Framework
-- ============================================

-- ============================================
-- 1. Profiles Table (extends Supabase Auth)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Test Ideas Table
-- ============================================

CREATE TABLE test_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 10),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 10),
  ease INTEGER NOT NULL CHECK (ease BETWEEN 1 AND 10),
  ice_score INTEGER NOT NULL,
  current_conversion_rate NUMERIC(6,2) NOT NULL,
  expected_improvement NUMERIC(6,2) NOT NULL,
  monthly_traffic INTEGER NOT NULL CHECK (monthly_traffic >= 0),
  status TEXT NOT NULL DEFAULT 'planned' 
    CHECK (status IN ('planned', 'running', 'completed')),
  test_duration INTEGER CHECK (test_duration > 0),
  actual_result NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Trigger Functions
-- ============================================

-- ICE Score 자동 계산
CREATE OR REPLACE FUNCTION calculate_ice_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ice_score := NEW.impact * NEW.confidence * NEW.ease;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ice_score
  BEFORE INSERT OR UPDATE OF impact, confidence, ease ON test_ideas
  FOR EACH ROW
  EXECUTE FUNCTION calculate_ice_score();

-- Updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_ideas_updated_at
  BEFORE UPDATE ON test_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 자동 프로필 생성 (회원가입 시 자동으로 profiles 레코드 생성)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'company', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_ideas ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Test Ideas 정책 (세분화된 보안)
CREATE POLICY "Users can view own test ideas"
  ON test_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test ideas"
  ON test_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test ideas"
  ON test_ideas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own test ideas"
  ON test_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- 게스트 모드 지원 (선택사항 - 주석 해제하여 사용)
-- CREATE POLICY "Guest users can view demo ideas"
--   ON test_ideas FOR SELECT
--   USING (user_id IS NULL);

-- ============================================
-- 5. Performance Indexes
-- ============================================

-- 기본 인덱스
CREATE INDEX idx_test_ideas_user_id 
  ON test_ideas(user_id);

CREATE INDEX idx_test_ideas_ice_score 
  ON test_ideas(ice_score DESC);

CREATE INDEX idx_test_ideas_status 
  ON test_ideas(status);

CREATE INDEX idx_test_ideas_created_at 
  ON test_ideas(created_at DESC);

-- 복합 인덱스 (자주 사용되는 쿼리 최적화)
CREATE INDEX idx_test_ideas_composite 
  ON test_ideas(user_id, status, ice_score DESC);

-- 날짜 범위 쿼리용
CREATE INDEX idx_test_ideas_user_created 
  ON test_ideas(user_id, created_at DESC);

-- 부분 인덱스 (완료된 테스트만)
CREATE INDEX idx_test_ideas_completed 
  ON test_ideas(user_id, actual_result) 
  WHERE status = 'completed';

-- Profiles 인덱스
CREATE INDEX idx_profiles_created_at 
  ON profiles(created_at DESC);

-- ============================================
-- 6. Useful Database Functions (Optional)
-- ============================================

-- 사용자의 상위 N개 테스트 아이디어 가져오기
CREATE OR REPLACE FUNCTION get_top_test_ideas(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS SETOF test_ideas AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM test_ideas
  WHERE user_id = user_uuid
  ORDER BY ice_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 월별 테스트 성과 집계
CREATE OR REPLACE FUNCTION get_monthly_performance(user_uuid UUID)
RETURNS TABLE(
  month TEXT,
  test_count BIGINT,
  avg_improvement NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(created_at, 'YYYY-MM') as month,
    COUNT(*) as test_count,
    AVG(actual_result) as avg_improvement
  FROM test_ideas
  WHERE user_id = user_uuid AND status = 'completed'
  GROUP BY TO_CHAR(created_at, 'YYYY-MM')
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 완료! 
-- 다음 단계: Supabase 대시보드에서 이 SQL을 실행하세요
-- ============================================


import { supabase } from '../lib/supabase/client';
import { toCamelCase, toSnakeCase } from '../lib/utils/case-converter';
import { TestIdea } from '../App';

/**
 * Test Ideas Service Layer
 * Supabase와 프론트엔드 사이의 데이터 변환 및 API 호출 담당
 */

export class TestIdeasService {
  // supabase 인스턴스를 외부에서 접근 가능하게 (인증 체크용)
  public supabase = supabase;

  /**
   * 모든 테스트 아이디어 조회 (ICE 점수 순)
   */
  async getAll(): Promise<TestIdea[]> {
    const { data, error } = await supabase
      .from('test_ideas')
      .select('*')
      .order('ice_score', { ascending: false });

    if (error) {
      console.error('[TestIdeasService.getAll] Error:', error);
      throw error;
    }

    return data.map(item => toCamelCase(item) as TestIdea);
  }

  /**
   * 특정 ID의 테스트 아이디어 조회
   */
  async getById(id: string): Promise<TestIdea> {
    const { data, error } = await supabase
      .from('test_ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[TestIdeasService.getById] Error:', error);
      throw error;
    }

    return toCamelCase(data) as TestIdea;
  }

  /**
   * 상태별 테스트 아이디어 조회
   */
  async getByStatus(status: 'planned' | 'running' | 'completed'): Promise<TestIdea[]> {
    const { data, error } = await supabase
      .from('test_ideas')
      .select('*')
      .eq('status', status)
      .order('ice_score', { ascending: false });

    if (error) {
      console.error('[TestIdeasService.getByStatus] Error:', error);
      throw error;
    }

    return data.map(item => toCamelCase(item) as TestIdea);
  }

  /**
   * 새 테스트 아이디어 생성
   */
  async create(idea: Omit<TestIdea, 'id' | 'createdAt'>): Promise<TestIdea> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create test ideas');
    }

    // DB가 자동으로 처리하거나 프론트엔드 전용 필드들 제거
    const {
      iceScore,     // trigger로 자동 계산
      status,       // DB default 'planned'
      id,           // 임시 ID 제거 (DB에서 UUID 생성)
      createdAt,    // DB에서 자동 생성
      userId,       // user.id로 직접 설정
      synced,       // 프론트엔드 전용 필드
      ...rest
    } = idea as any;

    // camelCase → snake_case 변환
    const snakeCaseData = toSnakeCase(rest);

    const { data, error } = await supabase
      .from('test_ideas')
      .insert({
        ...snakeCaseData,
        user_id: user.id,
        // status는 DB에서 default 'planned'로 설정됨
        // ice_score는 trigger로 자동 계산됨
      })
      .select()
      .single();

    if (error) {
      console.error('[TestIdeasService.create] Error:', error);
      console.error('[TestIdeasService.create] Error details:', error.message, error.details);
      throw error;
    }

    return toCamelCase(data) as TestIdea;
  }

  /**
   * 테스트 아이디어 업데이트
   */
  async update(id: string, updates: Partial<TestIdea>): Promise<TestIdea> {
    // camelCase → snake_case 변환
    const snakeCaseUpdates = toSnakeCase(updates);

    const { data, error } = await supabase
      .from('test_ideas')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[TestIdeasService.update] Error:', error);
      throw error;
    }

    return toCamelCase(data) as TestIdea;
  }

  /**
   * 테스트 아이디어 삭제
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('test_ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[TestIdeasService.delete] Error:', error);
      throw error;
    }
  }

  /**
   * 상위 N개 테스트 아이디어 조회 (데이터베이스 함수 사용)
   */
  async getTopIdeas(limit: number = 10): Promise<TestIdea[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .rpc('get_top_test_ideas', {
        user_uuid: user.id,
        limit_count: limit
      });

    if (error) {
      console.error('[TestIdeasService.getTopIdeas] Error:', error);
      throw error;
    }

    return data.map(item => toCamelCase(item) as TestIdea);
  }

  /**
   * 월별 성과 집계 (데이터베이스 함수 사용)
   */
  async getMonthlyPerformance(): Promise<Array<{
    month: string;
    testCount: number;
    avgImprovement: number;
  }>> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .rpc('get_monthly_performance', {
        user_uuid: user.id
      });

    if (error) {
      console.error('[TestIdeasService.getMonthlyPerformance] Error:', error);
      throw error;
    }

    return data.map(item => toCamelCase(item));
  }
}

// Singleton 인스턴스 export
export const testIdeasService = new TestIdeasService();


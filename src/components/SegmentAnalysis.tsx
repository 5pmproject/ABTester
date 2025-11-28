import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle, Info, Target, Brain, DollarSign, Smartphone } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, translations } from '../types/translations';

type SegmentAnalysisProps = {
  language: Language;
};

export default function SegmentAnalysis({ language }: SegmentAnalysisProps) {
  const t = translations[language];
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'gen-z' | 'millennial' | 'gen-x' | 'boomer'>('all');

  // ⚠️ 경고: 아래 데이터는 데모 목적의 예시 값입니다
  // 실제 값은 산업군, 지역, 제품 유형에 따라 크게 다를 수 있습니다
  // 출처: 일반적인 e-commerce 통계 범위 (Statista, eMarketer 2023-2024)
  // 프로덕션에서는 자사 데이터로 교체 필수!
  const generationData = [
    {
      id: 'gen-z',
      name: t.genZ,
      ageRange: t.genZAge,
      description: t.genZDesc,
      color: '#8B5CF6',
      conversionRate: 2.8, // 업계 평균: 1.5-3.5%
      avgOrderValue: 45, // 일반적 범위: $35-60
      mobileRate: 85, // Pew Research 2024: 75-85%
      socialProofSensitivity: 9, // 가정 값 - A/B 테스트로 검증 필요
      scarcitySensitivity: 7, // 가정 값 - A/B 테스트로 검증 필요
      authoritySensitivity: 5, // 가정 값 - A/B 테스트로 검증 필요
      behaviors: [
        '모바일 우선 경험 선호',
        '인플루언서 추천에 높은 반응',
        '빠른 결제 프로세스 선호 (원클릭)',
        '비디오 콘텐츠와 인터랙티브 요소 선호',
        'FOMO(Fear of Missing Out)에 민감'
      ],
      recommendations: [
        '소셜 미디어 통합 및 공유 기능 강화',
        '모바일 최적화 및 빠른 로딩 속도',
        '실시간 재고/구매 알림 활용',
        'AR/VR 체험 요소 도입',
        '인스타그램/틱톡 스타일 비주얼'
      ]
    },
    {
      id: 'millennial',
      name: t.millennial,
      ageRange: t.millennialAge,
      description: t.millennialDesc,
      color: '#3B82F6',
      conversionRate: 3.5,
      avgOrderValue: 65,
      mobileRate: 70,
      socialProofSensitivity: 8,
      scarcitySensitivity: 8,
      authoritySensitivity: 7,
      behaviors: [
        '리뷰와 평점을 꼼꼼히 확인',
        '가성비와 품질의 균형 중시',
        '이메일 마케팅에 여전히 반응',
        '브랜드 스토리와 가치에 공감',
        '비교 쇼핑 경향 강함'
      ],
      recommendations: [
        '상세한 제품 리뷰와 평점 시스템',
        '비교 기능 및 스펙 테이블 제공',
        '브랜드 미션과 지속가능성 강조',
        '로열티 프로그램과 멤버십 혜택',
        '개인화된 추천 알고리즘'
      ]
    },
    {
      id: 'gen-x',
      name: t.genX,
      ageRange: t.genXAge,
      description: t.genXDesc,
      color: '#10B981',
      conversionRate: 4.2,
      avgOrderValue: 85,
      mobileRate: 55,
      socialProofSensitivity: 6,
      scarcitySensitivity: 6,
      authoritySensitivity: 8,
      behaviors: [
        '전문가 의견과 권위 있는 추천 신뢰',
        '실용성과 기능성 중시',
        '데스크톱과 모바일 모두 사용',
        '보안과 개인정보 보호에 민감',
        '충성도 높고 재구매율 높음'
      ],
      recommendations: [
        '전문가 추천 및 인증 마크 강조',
        '보안 배지와 안전 결제 강조',
        '명확한 반품/환불 정책 표시',
        '전화 상담 등 다양한 고객 지원',
        '실용적 혜택과 할인 제공'
      ]
    },
    {
      id: 'boomer',
      name: t.boomer,
      ageRange: t.boomerAge,
      description: t.boomerDesc,
      color: '#F59E0B',
      conversionRate: 3.8,
      avgOrderValue: 95,
      mobileRate: 40,
      socialProofSensitivity: 5,
      scarcitySensitivity: 4,
      authoritySensitivity: 9,
      behaviors: [
        '브랜드 신뢰도와 평판 최우선',
        '충분한 정보와 설명 필요',
        '전화 주문 등 전통적 방식 선호도 높음',
        '보안에 매우 민감',
        '한 번 신뢰하면 장기 고객'
      ],
      recommendations: [
        '큰 글씨와 명확한 레이아웃',
        '단계별 상세 가이드 제공',
        '전화 문의 옵션 명확히 표시',
        '신뢰 신호 강화 (수상 경력, 역사)',
        '무료 배송과 쉬운 반품 정책'
      ]
    }
  ];

  const comparisonData = generationData.map(gen => ({
    name: gen.name,
    전환율: gen.conversionRate,
    평균주문금액: gen.avgOrderValue,
    모바일비율: gen.mobileRate
  }));

  const selectedGen = generationData.find(g => g.id === selectedSegment);

  const psychologicalProfile = selectedGen ? [
    { principle: '사회적 증거', value: selectedGen.socialProofSensitivity },
    { principle: '희소성', value: selectedGen.scarcitySensitivity },
    { principle: '권위', value: selectedGen.authoritySensitivity },
    { principle: '상호성', value: selectedGen.id === 'gen-z' ? 6 : selectedGen.id === 'millennial' ? 7 : selectedGen.id === 'gen-x' ? 8 : 7 },
    { principle: '일관성', value: selectedGen.id === 'gen-z' ? 5 : selectedGen.id === 'millennial' ? 7 : selectedGen.id === 'gen-x' ? 8 : 9 },
    { principle: '호감', value: selectedGen.id === 'gen-z' ? 8 : selectedGen.id === 'millennial' ? 7 : selectedGen.id === 'gen-x' ? 6 : 5 }
  ] : [];

  const devicePreference = [
    { device: '모바일', 'Z세대': 85, '밀레니얼': 70, 'X세대': 55, '베이비붐': 40 },
    { device: '데스크톱', 'Z세대': 10, '밀레니얼': 25, 'X세대': 40, '베이비붐': 55 },
    { device: '태블릿', 'Z세대': 5, '밀레니얼': 5, 'X세대': 5, '베이비붐': 5 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e1d9' }}>
            <Users className="w-6 h-6" style={{ color: '#a89075' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">{t.generationAnalysisTitle}</h2>
            <p className="text-gray-600">
              {t.generationAnalysisSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-yellow-900 font-medium mb-1">
              {language === 'ko' ? '⚠️ 데모 데이터 안내' : '⚠️ Demo Data Notice'}
            </h4>
            <p className="text-yellow-800 text-sm mb-2">
              {language === 'ko' 
                ? '이 페이지의 데이터는 교육 및 데모 목적의 예시 값입니다. 실제 운영 시에는 자사 데이터를 사용하시거나 아래 신뢰할 수 있는 출처의 최신 통계로 교체해야 합니다.' 
                : 'The data on this page is for educational and demo purposes only. For production use, please replace with your own data or verified statistics from trusted sources below.'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a 
                href="https://www.statista.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-700 hover:text-yellow-900 underline"
              >
                Statista
              </a>
              <span className="text-yellow-600">•</span>
              <a 
                href="https://www.emarketer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-700 hover:text-yellow-900 underline"
              >
                eMarketer
              </a>
              <span className="text-yellow-600">•</span>
              <a 
                href="https://www.pewresearch.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-700 hover:text-yellow-900 underline"
              >
                Pew Research
              </a>
              <span className="text-yellow-600">•</span>
              <a 
                href="https://baymard.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-700 hover:text-yellow-900 underline"
              >
                Baymard Institute
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">{t.generationSelection}</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedSegment('all')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedSegment === 'all'
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-900">{t.allGenerations}</p>
          </button>
          {generationData.map(gen => (
            <button
              key={gen.id}
              onClick={() => setSelectedSegment(gen.id as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedSegment === gen.id
                  ? `border-[${gen.color}] bg-opacity-10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedSegment === gen.id ? gen.color : undefined,
                backgroundColor: selectedSegment === gen.id ? `${gen.color}20` : undefined
              }}
            >
              <Users className="w-8 h-8 mx-auto mb-2" style={{ color: gen.color }} />
              <p className="text-gray-900">{gen.name}</p>
              <p className="text-gray-600 text-xs">{gen.ageRange}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedSegment === 'all' ? (
        <>
          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion & AOV Comparison */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">{t.conversionAndAOV}</h3>
              <div className="w-full" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="전환율" fill="#3B82F6" name={`${t.generationConversionRate} (%)`} />
                    <Bar yAxisId="right" dataKey="평균주문금액" fill="#10B981" name={`${t.generationAvgOrderValue} ($)`} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Preference */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">{t.devicePreference}</h3>
              <div className="w-full" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={devicePreference}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Z세대" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="밀레니얼" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="X세대" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="베이비붐" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Generation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generationData.map(gen => (
              <div
                key={gen.id}
                className="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: gen.color }}
                onClick={() => setSelectedSegment(gen.id as any)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${gen.color}20` }}
                  >
                    <Users className="w-6 h-6" style={{ color: gen.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{gen.name}</h3>
                    <p className="text-gray-600 text-sm">{gen.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-gray-600 text-xs mb-1">{t.generationConversionRate}</p>
                    <p className="text-gray-900">{gen.conversionRate}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-gray-600 text-xs mb-1">{t.avgOrder}</p>
                    <p className="text-gray-900">${gen.avgOrderValue}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <p className="text-gray-600 text-xs mb-1">{t.deviceMobile}</p>
                    <p className="text-gray-900">{gen.mobileRate}%</p>
                  </div>
                </div>

                <button
                  className="w-full py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: gen.color }}
                >
                  {t.viewDetails} →
                </button>
              </div>
            ))}
          </div>
        </>
      ) : selectedGen && (
        <>
          {/* Selected Generation Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${selectedGen.color}20` }}
              >
                <Users className="w-8 h-8" style={{ color: selectedGen.color }} />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 mb-2">{selectedGen.name} 세대 분석</h2>
                <p className="text-gray-600 mb-4">
                  {selectedGen.ageRange} • {selectedGen.description}
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">전환율</p>
                    <p className="text-gray-900 text-xl">{selectedGen.conversionRate}%</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">평균 주문 금액</p>
                    <p className="text-gray-900 text-xl">${selectedGen.avgOrderValue}</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">모바일 비율</p>
                    <p className="text-gray-900 text-xl">{selectedGen.mobileRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Psychological Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6" style={{ color: selectedGen.color }} />
                <h3 className="text-gray-900">심리적 프로필 (Cialdini 원리 민감도)</h3>
              </div>
              <div className="w-full" style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={psychologicalProfile}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="principle" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name={selectedGen.name}
                      dataKey="value"
                      stroke={selectedGen.color}
                      fill={selectedGen.color}
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-gray-600 text-sm text-center mt-4">
                점수가 높을수록 해당 설득 원리에 더 민감하게 반응합니다
              </p>
            </div>

            <div className="space-y-6">
              {/* Behavior Patterns */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-gray-900 mb-4">주요 행동 패턴</h3>
                <ul className="space-y-2">
                  {selectedGen.behaviors.map((behavior, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${selectedGen.color}20`, color: selectedGen.color }}
                      >
                        ✓
                      </div>
                      <span className="text-gray-700 text-sm">{behavior}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-gray-900 mb-4">🎯 A/B 테스트 추천 전략</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGen.recommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${selectedGen.color}20`, color: selectedGen.color }}
                    >
                      {index + 1}
                    </span>
                    <p className="text-gray-700 text-sm">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Ideas for This Segment */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">이 세대를 위한 테스트 아이디어</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGen.id === 'gen-z' && (
                <>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-gray-900 mb-2">소셜 프루프 강화</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      "1,000명이 오늘 구매했어요!" 실시간 구매 알림 추가
                    </p>
                    <span className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded">높은 효과 예상</span>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-gray-900 mb-2">모바일 원클릭 결제</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Apple Pay, Google Pay 등 간편 결제 옵션 강조
                    </p>
                    <span className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded">전환율 +20% 예상</span>
                  </div>
                </>
              )}
              {selectedGen.id === 'millennial' && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-gray-900 mb-2">리뷰 하이라이트</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      제품 페이지 상단에 베스트 리뷰 3개 강조 표시
                    </p>
                    <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded">높은 효과 예상</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-gray-900 mb-2">가치 기반 메시징</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      친환경/지속가능성 배지 추가 및 스토리 강조
                    </p>
                    <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded">브랜드 충성도 +15%</span>
                  </div>
                </>
              )}
              {selectedGen.id === 'gen-x' && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-gray-900 mb-2">전문가 추천 강조</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      "업계 전문가 추천" 배지와 인증 마크 추가
                    </p>
                    <span className="text-xs px-2 py-1 bg-green-200 text-green-700 rounded">신뢰도 +25%</span>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-gray-900 mb-2">보안 신호 강화</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      결제 페이지에 보안 배지와 SSL 인증 명확히 표시
                    </p>
                    <span className="text-xs px-2 py-1 bg-green-200 text-green-700 rounded">장바구니 포기율 -18%</span>
                  </div>
                </>
              )}
              {selectedGen.id === 'boomer' && (
                <>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-gray-900 mb-2">명확한 전화 상담 옵션</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      큰 버튼으로 "전화 주문: 1588-XXXX" 상단 고정
                    </p>
                    <span className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded">통화 전환 +30%</span>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-gray-900 mb-2">단순화된 레이아웃</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      글씨 크기 18px+, 명확한 단계별 가이드 제공
                    </p>
                    <span className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded">완료율 +22%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
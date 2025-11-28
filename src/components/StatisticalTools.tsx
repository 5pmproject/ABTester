import { useState } from 'react';
import { Calculator, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { Language, translations } from '../types/translations';

type StatisticalToolsProps = {
  language: Language;
};

export default function StatisticalTools({ language }: StatisticalToolsProps) {
  const t = translations[language];
  // Sample Size Calculator
  const [baselineConversion, setBaselineConversion] = useState(3);
  const [mde, setMde] = useState(10); // Minimum Detectable Effect
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [dailyTraffic, setDailyTraffic] = useState(5000);

  // Significance Calculator
  const [controlConversions, setControlConversions] = useState(150);
  const [controlVisitors, setControlVisitors] = useState(5000);
  const [variantConversions, setVariantConversions] = useState(175);
  const [variantVisitors, setVariantVisitors] = useState(5000);
  const [testDuration, setTestDuration] = useState(7);

  const calculateSampleSize = () => {
    const p1 = baselineConversion / 100;
    const p2 = p1 * (1 + mde / 100);
    const pAvg = (p1 + p2) / 2;
    
    // Z-scores for alpha and power
    const zAlpha = 1.96; // for alpha = 0.05 (two-tailed)
    const zBeta = 0.84; // for power = 0.8
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pAvg * (1 - pAvg);
    const denominator = Math.pow(p2 - p1, 2);
    
    const sampleSizePerVariant = Math.ceil(numerator / denominator);
    const totalSampleSize = sampleSizePerVariant * 2;
    const daysNeeded = Math.ceil(totalSampleSize / dailyTraffic);
    
    return {
      perVariant: sampleSizePerVariant,
      total: totalSampleSize,
      daysNeeded,
      expectedP2: (p2 * 100).toFixed(2)
    };
  };

  const calculateSignificance = () => {
    const p1 = controlConversions / controlVisitors;
    const p2 = variantConversions / variantVisitors;
    const pPool = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / controlVisitors + 1 / variantVisitors));
    const zScore = (p2 - p1) / se;
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    const improvementRate = ((p2 - p1) / p1) * 100;
    const confidenceInterval = 1.96 * se;
    const ciLower = ((p2 - p1 - confidenceInterval) / p1) * 100;
    const ciUpper = ((p2 - p1 + confidenceInterval) / p1) * 100;
    
    const isSignificant = pValue < alpha;
    const recommendedDuration = 14; // Best practice
    const isPeeking = testDuration < recommendedDuration;
    
    return {
      controlRate: (p1 * 100).toFixed(2),
      variantRate: (p2 * 100).toFixed(2),
      improvementRate: improvementRate.toFixed(2),
      zScore: zScore.toFixed(3),
      pValue: pValue.toFixed(4),
      isSignificant,
      ciLower: ciLower.toFixed(2),
      ciUpper: ciUpper.toFixed(2),
      isPeeking,
      recommendedDuration
    };
  };

  // Normal CDF approximation
  const normalCDF = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  const sampleSize = calculateSampleSize();
  const significance = calculateSignificance();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e1d9' }}>
            <Calculator className="w-6 h-6" style={{ color: '#a89075' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">{t.statisticalToolsTitle}</h2>
            <p className="text-gray-600">
              {t.statisticalToolsSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Sample Size Calculator */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-gray-900">{t.sampleSizeCalculator}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.baselineConversion}
              </label>
              <input
                type="number"
                step="0.1"
                value={baselineConversion}
                onChange={(e) => setBaselineConversion(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                {language === 'ko' ? '현재 웹사이트의 전환율' : 'Current website conversion rate'}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.mde}
              </label>
              <input
                type="number"
                step="1"
                value={mde}
                onChange={(e) => setMde(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                {language === 'ko' ? '감지하고 싶은 최소 개선율 (추천: 10-20%)' : 'Minimum improvement to detect (recommended: 10-20%)'}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.significanceLevel}
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.05}>
                  {language === 'ko' ? '0.05 (95% 신뢰도, 표준)' : '0.05 (95% confidence, standard)'}
                </option>
                <option value={0.01}>
                  {language === 'ko' ? '0.01 (99% 신뢰도, 엄격)' : '0.01 (99% confidence, strict)'}
                </option>
                <option value={0.1}>
                  {language === 'ko' ? '0.10 (90% 신뢰도, 완화)' : '0.10 (90% confidence, relaxed)'}
                </option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                {language === 'ko' ? 'False Positive 허용 비율 (표준: 0.05)' : 'False Positive rate (standard: 0.05)'}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.statisticalPower}
              </label>
              <select
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.8}>
                  {language === 'ko' ? '0.80 (80%, 표준)' : '0.80 (80%, standard)'}
                </option>
                <option value={0.9}>
                  {language === 'ko' ? '0.90 (90%, 높음)' : '0.90 (90%, high)'}
                </option>
                <option value={0.95}>
                  {language === 'ko' ? '0.95 (95%, 매우 높음)' : '0.95 (95%, very high)'}
                </option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                {language === 'ko' ? 'True Positive 감지 확률 (표준: 0.8)' : 'True Positive detection rate (standard: 0.8)'}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.dailyTrafficInput}
              </label>
              <input
                type="number"
                step="100"
                value={dailyTraffic}
                onChange={(e) => setDailyTraffic(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                {language === 'ko' ? '하루 방문자 수' : 'Daily visitors'}
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="text-blue-900 mb-4">📊 {t.requiredSampleSize}</h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-600 text-sm mb-1">{t.perVariant}</p>
                  <p className="text-blue-900 text-3xl">{sampleSize.perVariant.toLocaleString()}</p>
                  <p className="text-blue-600 text-xs mt-1">{t.visitors}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-600 text-sm mb-1">{t.totalSamples}</p>
                  <p className="text-blue-900 text-3xl">{sampleSize.total.toLocaleString()}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    {language === 'ko' ? '방문자 (Control + Variant)' : 'Visitors (Control + Variant)'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-600 text-sm mb-1">{t.testDurationDays}</p>
                  <p className="text-blue-900 text-3xl">{sampleSize.daysNeeded}</p>
                  <p className="text-blue-600 text-xs mt-1">
                    {language === 'ko' ? '일 (현재 트래픽 기준)' : 'days (based on current traffic)'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-blue-700 text-sm mb-2">
                  {language === 'ko' ? '예상 결과' : 'Expected Results'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 text-sm">{t.baselineConversion}</span>
                  <span className="text-blue-900">{baselineConversion}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 text-sm">{t.expectedVariantRate}</span>
                  <span className="text-blue-900">{sampleSize.expectedP2}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 text-sm">{t.improvement}</span>
                  <span className="text-green-600">+{mde}%</span>
                </div>
              </div>
            </div>

            {sampleSize.daysNeeded > 30 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 text-sm mb-1">
                      {language === 'ko' ? '⚠️ 긴 테스트 기간 경고' : '⚠️ Long Test Duration Warning'}
                    </p>
                    <p className="text-yellow-700 text-xs">
                      {language === 'ko' 
                        ? `${sampleSize.daysNeeded}일은 매우 긴 기간입니다. MDE를 높이거나 트래픽이 더 많은 페이지에서 테스트하는 것을 고려하세요.`
                        : `${sampleSize.daysNeeded} days is a very long period. Consider increasing MDE or testing on pages with higher traffic.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Significance Calculator */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-900">{t.significanceCalculator}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-gray-900 mb-3">{t.controlGroup}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">{t.visitors}</label>
                  <input
                    type="number"
                    value={controlVisitors}
                    onChange={(e) => setControlVisitors(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">{t.conversions}</label>
                  <input
                    type="number"
                    value={controlConversions}
                    onChange={(e) => setControlConversions(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-gray-900 mb-3">{t.variantGroup}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">{t.visitors}</label>
                  <input
                    type="number"
                    value={variantVisitors}
                    onChange={(e) => setVariantVisitors(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">{t.conversions}</label>
                  <input
                    type="number"
                    value={variantConversions}
                    onChange={(e) => setVariantConversions(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.currentTestDuration}
              </label>
              <input
                type="number"
                value={testDuration}
                onChange={(e) => setTestDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className={`${significance.isSignificant ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                {significance.isSignificant ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-gray-600" />
                )}
                <h4 className={significance.isSignificant ? 'text-green-900' : 'text-gray-900'}>
                  {significance.isSignificant 
                    ? `✅ ${t.statistically} ${t.significant}`
                    : `⚠️ ${t.statistically} ${t.notSignificant}`
                  }
                </h4>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">
                      {language === 'ko' ? 'Control 전환율' : 'Control Conversion Rate'}
                    </span>
                    <span className="text-gray-900">{significance.controlRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      {language === 'ko' ? 'Variant 전환율' : 'Variant Conversion Rate'}
                    </span>
                    <span className="text-gray-900">{significance.variantRate}%</span>
                  </div>
                </div>

                <div className={`rounded-lg p-3 border ${
                  parseFloat(significance.improvementRate) > 0 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-red-100 border-red-300'
                }`}>
                  <p className="text-gray-600 text-sm mb-1">{t.improvement}</p>
                  <p className={`text-3xl ${
                    parseFloat(significance.improvementRate) > 0 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {significance.improvementRate > '0' ? '+' : ''}{significance.improvementRate}%
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {t.confidenceInterval}: [{significance.ciLower}%, {significance.ciUpper}%]
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{t.zScore}</span>
                    <span className="text-gray-900">{significance.zScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{t.pValue}</span>
                    <span className={`${
                      significance.isSignificant ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {significance.pValue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{t.significanceLevel}</span>
                    <span className="text-gray-900">&lt; {alpha}</span>
                  </div>
                </div>
              </div>
            </div>

            {significance.isPeeking && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 text-sm mb-1">🚫 {t.pHackingWarning}</p>
                    <p className="text-red-700 text-xs mb-2">
                      {t.pHackingMessage}
                    </p>
                    <p className="text-red-600 text-xs">
                      {language === 'ko'
                        ? `최소 ${significance.recommendedDuration}일 이상 테스트를 진행한 후 결과를 확인하세요.`
                        : `Test for at least ${significance.recommendedDuration} days before checking results.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!significance.isSignificant && !significance.isPeeking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 text-sm mb-1">
                      {language === 'ko' ? '💡 권장 사항' : '💡 Recommendation'}
                    </p>
                    <p className="text-blue-700 text-xs">
                      {language === 'ko'
                        ? '아직 통계적으로 유의미한 차이가 없습니다. 더 많은 샘플을 수집하거나 효과가 더 큰 변형을 테스트해보세요.'
                        : 'No statistically significant difference yet. Collect more samples or test variants with larger effects.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistical Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">
            {language === 'ko' ? '✅ 통계적 엄밀성 체크리스트' : '✅ Statistical Rigor Checklist'}
          </h4>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko' 
                  ? '사전에 샘플 사이즈를 계산하고 테스트 시작'
                  : 'Calculate sample size before starting test'
                }
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko'
                  ? '최소 14일 이상 테스트 진행 (주간 패턴 고려)'
                  : 'Run test for at least 14 days (account for weekly patterns)'
                }
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko'
                  ? '목표 샘플 사이즈 달성 전 중간 확인 자제'
                  : 'Avoid peeking before reaching target sample size'
                }
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko'
                  ? 'Alpha 0.05, Power 0.8 기준 준수'
                  : 'Follow Alpha 0.05, Power 0.8 standards'
                }
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko'
                  ? '95% 신뢰구간(CI) 함께 보고'
                  : 'Report 95% confidence interval (CI)'
                }
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 text-sm">
                {language === 'ko'
                  ? '세그먼트별 분석은 사전 계획에만 포함'
                  : 'Include segment analysis only in pre-planned tests'
                }
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">
            {language === 'ko' ? '⚠️ 흔한 통계적 오류' : '⚠️ Common Statistical Errors'}
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 text-sm">❌</span>
              <div>
                <p className="text-red-900 text-sm">P-hacking</p>
                <p className="text-red-600 text-xs">
                  {language === 'ko'
                    ? '원하는 결과가 나올 때까지 반복 확인'
                    : 'Repeatedly checking until desired result appears'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 text-sm">❌</span>
              <div>
                <p className="text-red-900 text-sm">
                  {language === 'ko' ? '샘플 사이즈 무시' : 'Ignoring Sample Size'}
                </p>
                <p className="text-red-600 text-xs">
                  {language === 'ko'
                    ? '충분한 데이터 없이 조기 결론'
                    : 'Drawing conclusions without sufficient data'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 text-sm">❌</span>
              <div>
                <p className="text-red-900 text-sm">
                  {language === 'ko' ? '다중 비교 문제' : 'Multiple Comparisons'}
                </p>
                <p className="text-red-600 text-xs">
                  {language === 'ko'
                    ? '여러 세그먼트 동시 테스트 시 보정 없음'
                    : 'Testing multiple segments without correction'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 text-sm">❌</span>
              <div>
                <p className="text-red-900 text-sm">
                  {language === 'ko' ? '계절성 무시' : 'Ignoring Seasonality'}
                </p>
                <p className="text-red-600 text-xs">
                  {language === 'ko'
                    ? '주말/주중, 월초/월말 패턴 미고려'
                    : 'Not accounting for weekend/weekday, monthly patterns'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
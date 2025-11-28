import { useState } from 'react';
import { TestIdea } from '../App';
import { Brain, TrendingDown, Users, Shield, Repeat, Gift, CheckCircle, DollarSign } from 'lucide-react';
import { Language, translations } from '../types/translations';

type BehavioralEconomicsProps = {
  testIdeas: TestIdea[];
  language: Language;
  onNavigateToICE?: () => void;
};

export default function BehavioralEconomics({ testIdeas, language, onNavigateToICE }: BehavioralEconomicsProps) {
  const t = translations[language];
  const [selectedTestId, setSelectedTestId] = useState<string>(testIdeas[0]?.id || '');
  const [avgOrderValue, setAvgOrderValue] = useState(50);
  const [delayDays, setDelayDays] = useState(7);

  const selectedTest = testIdeas.find(test => test.id === selectedTestId);

  const calculateOpportunityCost = () => {
    if (!selectedTest) return { daily: 0, weekly: 0, monthly: 0, psychological: 0 };

    const currentRevenue = (selectedTest.monthlyTraffic * selectedTest.currentConversionRate / 100) * avgOrderValue;
    const potentialRevenue = currentRevenue * (1 + selectedTest.expectedImprovement / 100);
    const dailyLoss = (potentialRevenue - currentRevenue) / 30;
    
    return {
      daily: dailyLoss,
      weekly: dailyLoss * 7,
      monthly: dailyLoss * 30,
      psychological: dailyLoss * 2.5,
      totalLoss: dailyLoss * delayDays,
      psychologicalTotalLoss: dailyLoss * delayDays * 2.5
    };
  };

  const opportunityCost = calculateOpportunityCost();

  const cialdiniPrinciples = [
    {
      id: 'reciprocity',
      name: t.reciprocity,
      icon: <Gift className="w-6 h-6" />,
      color: 'teal',
      description: t.reciprocityDesc,
      examples: [t.freeTrialSample, t.valuableContent, t.unexpectedBonus],
      implementation: t.provideValueFirst
    },
    {
      id: 'commitment',
      name: t.commitmentConsistency,
      icon: <Repeat className="w-6 h-6" />,
      color: 'blue',
      description: t.commitmentDesc,
      examples: [t.smallCommitments, t.progressBar, t.remindPastChoices],
      implementation: t.microCommitments
    },
    {
      id: 'social-proof',
      name: t.socialProof,
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      description: t.socialProofDesc,
      examples: [t.customerReviews, t.purchaseCount, t.popularBadge],
      implementation: t.realtimeNotifications
    },
    {
      id: 'authority',
      name: t.authority,
      icon: <Shield className="w-6 h-6" />,
      color: 'purple',
      description: t.authorityDesc,
      examples: [t.expertEndorsement, t.awards, t.certifications],
      implementation: t.trustSignals
    },
    {
      id: 'liking',
      name: t.liking,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'pink',
      description: t.likingDesc,
      examples: [t.friendlyTone, t.storytelling, t.similarCases],
      implementation: t.similarPersonas
    },
    {
      id: 'scarcity',
      name: t.scarcity,
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'red',
      description: t.scarcityDesc,
      examples: [t.limitedStock, t.countdownTimer, t.limitedOffer],
      implementation: t.showConstraints
    }
  ];

  const [checkedPrinciples, setCheckedPrinciples] = useState<string[]>([]);

  const togglePrinciple = (id: string) => {
    setCheckedPrinciples(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // 테스트 아이디어가 없을 때 안내 메시지
  if (testIdeas.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e1d9' }}>
              <Brain className="w-6 h-6" style={{ color: '#a89075' }} />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">{t.behavioralTitle}</h2>
              <p className="text-gray-600">
                {t.behavioralSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">
            {language === 'ko' ? '테스트 아이디어가 없습니다' : 'No Test Ideas'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'ko' 
              ? 'ICE Calculator에서 테스트 아이디어를 먼저 추가해주세요.' 
              : 'Please add test ideas from ICE Calculator first.'}
          </p>
          <button
            onClick={() => onNavigateToICE && onNavigateToICE()}
            className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-colors cursor-pointer"
          >
            {language === 'ko' ? 'ICE Calculator로 이동' : 'Go to ICE Calculator'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e1d9' }}>
            <Brain className="w-6 h-6" style={{ color: '#a89075' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">{t.behavioralTitle}</h2>
            <p className="text-gray-600">
              {t.behavioralSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Opportunity Cost Calculator (Kahneman's Loss Aversion) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-red-600" />
          <h3 className="text-gray-900">{t.opportunityCostCalculator}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.testSelection}
              </label>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {testIdeas.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.avgOrderValue}
              </label>
              <input
                type="number"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                {t.testDelayDays}
              </label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h4 className="text-red-900 mb-4">⚠️ {t.missedAmount}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.dailyLoss}</p>
                  <p className="text-red-900 text-xl">${opportunityCost.daily.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.weeklyLoss}</p>
                  <p className="text-red-900 text-xl">${opportunityCost.weekly.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.monthlyLoss}</p>
                  <p className="text-red-900 text-xl">${opportunityCost.monthly.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-300">
                  <p className="text-red-600 text-sm mb-1">{t.psychologicalLoss}</p>
                  <p className="text-red-900 text-xl">${opportunityCost.psychological.toFixed(0)}</p>
                  <p className="text-red-500 text-xs mt-1">×2.5 {t.multiplier}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-red-700">{delayDays} {t.totalLossForDays}</p>
                  <p className="text-red-900 text-2xl">${(opportunityCost?.totalLoss ?? 0).toFixed(0)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-red-200">
                  <p className="text-red-700">{t.kahnemanLossAversion}</p>
                  <p className="text-red-900 text-2xl">${(opportunityCost?.psychologicalTotalLoss ?? 0).toFixed(0)}</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-900 text-sm">
                  <strong>💡 {t.psychologicalInsight}</strong> {t.psychologicalInsightText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cialdini's 6 Principles */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-6">{t.cialdiniPrinciples}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cialdiniPrinciples.map((principle) => (
            <div
              key={principle.id}
              className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                checkedPrinciples.includes(principle.id)
                  ? `border-${principle.color}-500 bg-${principle.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => togglePrinciple(principle.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  checkedPrinciples.includes(principle.id)
                    ? `bg-${principle.color}-100 text-${principle.color}-600`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {principle.icon}
                </div>
                <input
                  type="checkbox"
                  checked={checkedPrinciples.includes(principle.id)}
                  onChange={() => {}}
                  className="w-5 h-5"
                />
              </div>
              <h4 className="text-gray-900 mb-2">{principle.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{principle.description}</p>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 text-sm">{t.examples}</p>
                <ul className="space-y-1">
                  {principle.examples.map((example, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 text-sm mb-1">{t.implementation}</p>
                <p className="text-gray-600 text-xs">{principle.implementation}</p>
              </div>
            </div>
          ))}
        </div>

        {checkedPrinciples.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900 mb-2">
              ✅ <strong>{checkedPrinciples.length}</strong>{t.principlesSelected}
            </p>
            <p className="text-green-700 text-sm">
              {t.multiplePrinciplesNote}
            </p>
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
          <h4 className="text-gray-900 mb-4">✅ {t.recommendations}</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.lossFraming}</p>
                <p className="text-gray-600 text-xs">
                  {t.lossFramingDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.immediacy}</p>
                <p className="text-gray-600 text-xs">
                  {t.immediacyDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.specificNumbers}</p>
                <p className="text-gray-600 text-xs">
                  {t.specificNumbersDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.combinePrinciples}</p>
                <p className="text-gray-600 text-xs">
                  {t.combinePrinciplesDesc}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <h4 className="text-gray-900 mb-4">⚠️ {t.warnings}</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.noFalseScarcity}</p>
                <p className="text-gray-600 text-xs">
                  {t.noFalseScarcityDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.moderateUrgency}</p>
                <p className="text-gray-600 text-xs">
                  {t.moderateUrgencyDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.ethicalPersuasion}</p>
                <p className="text-gray-600 text-xs">
                  {t.ethicalPersuasionDesc}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">{t.culturalDifferences}</p>
                <p className="text-gray-600 text-xs">
                  {t.culturalDifferencesDesc}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

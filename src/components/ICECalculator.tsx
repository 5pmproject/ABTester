import { useState } from 'react';
import { TestIdea } from '../App';
import { Calculator, Info, Plus, TrendingUp } from 'lucide-react';
import { Language, translations } from '../types/translations';

type ICECalculatorProps = {
  onAddTestIdea: (idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>) => void;
  language: Language;
};

export default function ICECalculator({ onAddTestIdea, language }: ICECalculatorProps) {
  const t = translations[language];
  const [name, setName] = useState('');
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [ease, setEase] = useState(5);
  const [currentConversionRate, setCurrentConversionRate] = useState(3);
  const [expectedImprovement, setExpectedImprovement] = useState(15);
  const [monthlyTraffic, setMonthlyTraffic] = useState(50000);

  const iceScore = impact * confidence * ease;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t.alertEnterName);
      return;
    }
    onAddTestIdea({
      name,
      impact,
      confidence,
      ease,
      currentConversionRate,
      expectedImprovement,
      monthlyTraffic
    });
    // Reset form
    setName('');
    setImpact(5);
    setConfidence(5);
    setEase(5);
    setCurrentConversionRate(3);
    setExpectedImprovement(15);
    setMonthlyTraffic(50000);
    alert(t.alertIdeaAdded);
  };

  const getScoreLevel = (score: number) => {
    if (score >= 600) return { label: t.topPriority, color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 400) return { label: t.highPriority, color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 200) return { label: t.mediumPriority, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: t.lowPriority, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const scoreLevel = getScoreLevel(iceScore);

  const impactGuidelines = [
    { score: '9-10', desc: t.impactGuide1 },
    { score: '7-8', desc: t.impactGuide2 },
    { score: '5-6', desc: t.impactGuide3 },
    { score: '3-4', desc: t.impactGuide4 },
    { score: '1-2', desc: t.impactGuide5 }
  ];

  const confidenceGuidelines = [
    { score: '9-10', desc: t.confidenceGuide1 },
    { score: '7-8', desc: t.confidenceGuide2 },
    { score: '5-6', desc: t.confidenceGuide3 },
    { score: '3-4', desc: t.confidenceGuide4 },
    { score: '1-2', desc: t.confidenceGuide5 }
  ];

  const easeGuidelines = [
    { score: '9-10', desc: t.easeGuide1 },
    { score: '7-8', desc: t.easeGuide2 },
    { score: '5-6', desc: t.easeGuide3 },
    { score: '3-4', desc: t.easeGuide4 },
    { score: '1-2', desc: t.easeGuide5 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e1d9' }}>
            <Calculator className="w-6 h-6" style={{ color: '#a89075' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 mb-2">{t.iceCalculatorTitle}</h2>
            <p className="text-gray-600">
              {t.iceCalculatorDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t.testIdeaName} {t.required}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.testIdeaPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Impact */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">
                  {t.impact}: {impact}
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover:block absolute right-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                    {t.impactTooltip}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-teal"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 ({t.low})</span>
                <span>10 ({t.high})</span>
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">
                  {t.confidence}: {confidence}
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover:block absolute right-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                    {t.confidenceTooltip}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 ({t.uncertain})</span>
                <span>10 ({t.certain})</span>
              </div>
            </div>

            {/* Ease */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">
                  {t.ease}: {ease}
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover:block absolute right-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                    {t.easeTooltip}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={ease}
                onChange={(e) => setEase(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 ({t.difficult})</span>
                <span>10 ({t.easy})</span>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  {t.currentConversionRate}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentConversionRate}
                  onChange={(e) => setCurrentConversionRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  {t.expectedImprovement}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={expectedImprovement}
                  onChange={(e) => setExpectedImprovement(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  {t.monthlyTraffic}
                </label>
                <input
                  type="number"
                  step="1000"
                  value={monthlyTraffic}
                  onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.addTestIdea}
            </button>
          </form>
        </div>

        {/* Score Display */}
        <div className="space-y-6">
          {/* ICE Score Card */}
          <div className={`${scoreLevel.bg} rounded-xl p-6 border-2 ${scoreLevel.color.replace('text', 'border')}`}>
            <div className="text-center">
              <p className="text-gray-600 mb-2">{t.iceScore}</p>
              <p className={`text-5xl mb-2 ${scoreLevel.color}`}>{iceScore}</p>
              <div className={`inline-block px-4 py-2 rounded-full ${scoreLevel.color} bg-white`}>
                {scoreLevel.label}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.impact}</span>
                    <span className="text-teal-600">{impact} × 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.confidence}</span>
                    <span className="text-blue-600">{confidence} × 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.ease}</span>
                    <span className="text-green-600">{ease}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expected ROI */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h4 className="text-gray-900">{t.expectedPerformance}</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm mb-1">{t.currentConversionRate}</p>
                <p className="text-gray-900 text-xl">{currentConversionRate}%</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">{t.expectedConversionRate}</p>
                <p className="text-teal-600 text-xl">
                  {(currentConversionRate * (1 + expectedImprovement / 100)).toFixed(2)}%
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-1">{t.additionalConversions}</p>
                <p className="text-blue-600 text-xl">
                  +{Math.round((monthlyTraffic * currentConversionRate / 100) * (expectedImprovement / 100))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Impact Guidelines */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.impactGuideTitle}</h4>
          <div className="space-y-2">
            {impactGuidelines.map((guide, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-teal-600 font-mono">{guide.score}</span>
                <span className="text-gray-600">{guide.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Guidelines */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.confidenceGuideTitle}</h4>
          <div className="space-y-2">
            {confidenceGuidelines.map((guide, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-blue-600 font-mono">{guide.score}</span>
                <span className="text-gray-600">{guide.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ease Guidelines */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.easeGuideTitle}</h4>
          <div className="space-y-2">
            {easeGuidelines.map((guide, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-green-600 font-mono">{guide.score}</span>
                <span className="text-gray-600">{guide.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .slider-teal::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #008080;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-blue::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #4682B4;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-green::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #48bb78;
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

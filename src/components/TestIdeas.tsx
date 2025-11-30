import { useState } from 'react';
import { TestIdea } from '../App';
import { Search, Filter, Trash2, Edit, Play, CheckCircle, Clock, Lightbulb, TrendingUp, ArrowUpDown, CloudOff } from 'lucide-react';
import { Language, translations } from '../types/translations';

type TestIdeasProps = {
  testIdeas: TestIdea[];
  onUpdate: (id: string, updates: Partial<TestIdea>) => void;
  onDelete: (id: string) => void;
  language: Language;
};

export default function TestIdeas({ testIdeas, onUpdate, onDelete, language }: TestIdeasProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'running' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'iceScore' | 'createdAt' | 'expectedImprovement'>('iceScore');
  const [, setEditingId] = useState<string | null>(null);

  const filteredIdeas = testIdeas
    .filter(idea => {
      const matchesSearch = idea.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'iceScore') return b.iceScore - a.iceScore;
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'expectedImprovement') return b.expectedImprovement - a.expectedImprovement;
      return 0;
    });

  const handleStatusChange = (id: string, newStatus: TestIdea['status']) => {
    onUpdate(id, { status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      onDelete(id);
    }
  };

  const getStatusBadge = (status: TestIdea['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            {t.completed}
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            {t.running}
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Lightbulb className="w-4 h-4" />
            {t.planned}
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 600) return 'text-green-600';
    if (score >= 400) return 'text-blue-600';
    if (score >= 200) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-gray-900 mb-2">{t.testIdeasTitle}</h2>
            <p className="text-gray-600">
              {t.showing} {testIdeas.length}{t.of} {filteredIdeas.length}{t.displayed}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-600 text-sm">{t.planned}</p>
              <p className="text-blue-900">{testIdeas.filter(test => test.status === 'planned').length}</p>
            </div>
            <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-600 text-sm">{t.running}</p>
              <p className="text-yellow-900">{testIdeas.filter(test => test.status === 'running').length}</p>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-600 text-sm">{t.completed}</p>
              <p className="text-green-900">{testIdeas.filter(test => test.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">{t.allStatus}</option>
              <option value="planned">{t.planned}</option>
              <option value="running">{t.running}</option>
              <option value="completed">{t.completed}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="iceScore">{t.sortByIceScore}</option>
              <option value="createdAt">{t.sortByDate}</option>
              <option value="expectedImprovement">{t.sortByImprovement}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">{t.noTestIdeas}</h3>
          <p className="text-gray-600">
            {t.noTestIdeasDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIdeas.map((idea, index) => (
            <div
              key={idea.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {index + 1}
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900">{idea.name}</h3>
                        {idea.synced === false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            <CloudOff className="w-3 h-3" />
                            {language === 'ko' ? '로컬만' : 'Local only'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(idea.status)}
                        <span className="text-gray-500 text-sm">
                          {t.registeredDate}: {new Date(idea.createdAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl ${getScoreColor(idea.iceScore)}`}>
                        {idea.iceScore}
                      </p>
                      <p className="text-gray-500 text-sm">{t.iceScore}</p>
                    </div>
                  </div>

                  {/* ICE Breakdown */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                      <p className="text-teal-600 text-sm mb-1">{t.impact}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-teal-900 text-xl">{idea.impact}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded ${
                                i < idea.impact ? 'bg-teal-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-blue-600 text-sm mb-1">{t.confidence}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-blue-900 text-xl">{idea.confidence}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded ${
                                i < idea.confidence ? 'bg-blue-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-green-600 text-sm mb-1">{t.ease}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-green-900 text-xl">{idea.ease}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded ${
                                i < idea.ease ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{t.currentConversionRate}</p>
                      <p className="text-gray-900">{idea.currentConversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{t.expectedImprovement}</p>
                      <p className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +{idea.expectedImprovement}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{t.monthlyTraffic}</p>
                      <p className="text-gray-900">{idea.monthlyTraffic.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{t.expectedAdditionalConversion}</p>
                      <p className="text-blue-600">
                        +{Math.round((idea.monthlyTraffic * idea.currentConversionRate / 100) * (idea.expectedImprovement / 100))}
                      </p>
                    </div>
                  </div>

                  {/* Results (for completed tests) */}
                  {idea.status === 'completed' && idea.actualResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-700 text-sm mb-1">{t.actualImprovement}</p>
                          <p className="text-green-900 text-2xl">+{idea.actualResult}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-700 text-sm mb-1">{t.predictionAccuracy}</p>
                          <p className="text-green-900 text-2xl">
                            {((idea.actualResult / idea.expectedImprovement) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {idea.status === 'planned' && (
                      <button
                        onClick={() => handleStatusChange(idea.id, 'running')}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        {t.startTest}
                      </button>
                    )}
                    {idea.status === 'running' && (
                      <button
                        onClick={() => handleStatusChange(idea.id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t.completeTest}
                      </button>
                    )}
                    {idea.status === 'completed' && (
                      <button
                        onClick={() => handleStatusChange(idea.id, 'planned')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Lightbulb className="w-4 h-4" />
                        {t.retest}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingId(idea.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.avgIceScore}</h4>
          <p className="text-4xl text-teal-600 mb-2">
            {testIdeas.length > 0 
              ? Math.round(testIdeas.reduce((acc, test) => acc + test.iceScore, 0) / testIdeas.length)
              : 0}
          </p>
          <p className="text-gray-600 text-sm">
            {t.totalAverage} {testIdeas.length}{t.ideaAverage}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.avgExpectedImprovement}</h4>
          <p className="text-4xl text-blue-600 mb-2">
            {testIdeas.length > 0
              ? (testIdeas.reduce((acc, test) => acc + test.expectedImprovement, 0) / testIdeas.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-gray-600 text-sm">
            {t.expectedEffect}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-gray-900 mb-4">{t.completedTests}</h4>
          <p className="text-4xl text-green-600 mb-2">
            {testIdeas.filter(test => test.status === 'completed').length}
          </p>
          <p className="text-gray-600 text-sm">
            {t.completionRate} {testIdeas.length}{t.completionRateOf}{' '}
            {testIdeas.length > 0 
              ? ((testIdeas.filter(test => test.status === 'completed').length / testIdeas.length) * 100).toFixed(0)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

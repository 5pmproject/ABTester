import { TestIdea } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { Language, translations } from '../types/translations';

type DashboardProps = {
  testIdeas: TestIdea[];
  language: Language;
};

export default function Dashboard({ testIdeas, language }: DashboardProps) {
  const t = translations[language];
  const sortedIdeas = [...testIdeas].sort((a, b) => b.iceScore - a.iceScore);
  const topIdeas = sortedIdeas.slice(0, 5);

  const completedTests = testIdeas.filter(test => test.status === 'completed');
  const runningTests = testIdeas.filter(test => test.status === 'running');
  const plannedTests = testIdeas.filter(test => test.status === 'planned');

  const avgSuccessRate = completedTests.length > 0
    ? completedTests.reduce((acc, test) => acc + (test.actualResult || 0), 0) / completedTests.length
    : 0;

  const totalOpportunityCost = plannedTests.reduce((acc, idea) => {
    const currentRevenue = (idea.monthlyTraffic * idea.currentConversionRate / 100) * 50;
    const potentialRevenue = currentRevenue * (1 + idea.expectedImprovement / 100);
    const dailyLoss = (potentialRevenue - currentRevenue) / 30;
    return acc + dailyLoss;
  }, 0);

  const statusData = [
    { name: t.planned, value: plannedTests.length, color: '#3B82F6' },
    { name: t.running, value: runningTests.length, color: '#F59E0B' },
    { name: t.completed, value: completedTests.length, color: '#10B981' }
  ];

  const iceDistribution = topIdeas.map(idea => ({
    name: idea.name.length > 20 ? idea.name.substring(0, 20) + '...' : idea.name,
    ICE: idea.iceScore,
    [t.impact]: idea.impact * 100,
    [t.confidence]: idea.confidence * 100,
    [t.ease]: idea.ease * 100
  }));

  const monthlyPerformance = language === 'ko' ? [
    { month: '7월', testsCompleted: 3, successRate: 67 },
    { month: '8월', testsCompleted: 4, successRate: 75 },
    { month: '9월', testsCompleted: 5, successRate: 80 },
    { month: '10월', testsCompleted: 6, successRate: 83 },
    { month: '11월', testsCompleted: 5, successRate: 78 }
  ] : [
    { month: 'Jul', testsCompleted: 3, successRate: 67 },
    { month: 'Aug', testsCompleted: 4, successRate: 75 },
    { month: 'Sep', testsCompleted: 5, successRate: 80 },
    { month: 'Oct', testsCompleted: 6, successRate: 83 },
    { month: 'Nov', testsCompleted: 5, successRate: 78 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-earth animate-fadeIn">
        <h2 className="text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{t.dashboardTitle}</h2>
        <p className="text-gray-600 mb-6">
          {t.dashboardSubtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 hover-lift border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5" style={{ color: '#a89075' }} />
              <span className="text-sm text-gray-700 font-medium">{t.totalIdeas}</span>
            </div>
            <p className="text-gray-900 text-2xl font-semibold">{testIdeas.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover-lift border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: '#a89075' }} />
              <span className="text-sm text-gray-700 font-medium">{t.inProgress}</span>
            </div>
            <p className="text-gray-900 text-2xl font-semibold">{runningTests.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover-lift border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: '#a89075' }} />
              <span className="text-sm text-gray-700 font-medium">{t.avgSuccessRate}</span>
            </div>
            <p className="text-gray-900 text-2xl font-semibold">{avgSuccessRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover-lift border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" style={{ color: '#a89075' }} />
              <span className="text-sm text-gray-700 font-medium">{t.dailyOpportunityCost}</span>
            </div>
            <p className="text-gray-900 text-2xl font-semibold">${totalOpportunityCost.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Priority Tests */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">{t.topPriorityTests}</h3>
          <div className="space-y-3">
            {topIdeas.map((idea, index) => (
              <div
                key={idea.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      background: index === 0 ? 'linear-gradient(135deg, #c9b5a0 0%, #a89075 100%)' :
                                  index === 1 ? '#a89075' :
                                  index === 2 ? '#8b7d6b' :
                                  '#6b5d52'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{idea.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        I:{idea.impact} C:{idea.confidence} E:{idea.ease}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        idea.status === 'completed' ? 'bg-green-100 text-green-700' :
                        idea.status === 'running' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {idea.status === 'completed' ? t.completed :
                         idea.status === 'running' ? t.running : t.planned}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-teal-600">{idea.iceScore}</p>
                  <p className="text-xs text-gray-500">ICE</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">{t.testStatus}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {statusData.map((status) => (
              <div key={status.name} className="text-center">
                <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: status.color }} />
                <p className="text-gray-600 text-sm">{status.name}</p>
                <p className="text-gray-900">{status.value}{t.items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ICE Score Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">{t.iceScoreDistribution}</h3>
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={iceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={t.impact} fill="#008080" />
                <Bar dataKey={t.confidence} fill="#4682B4" />
                <Bar dataKey={t.ease} fill="#48bb78" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">{t.monthlyPerformance}</h3>
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="testsCompleted" stroke="#008080" strokeWidth={2} name={t.testsCompleted} />
                <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#4682B4" strokeWidth={2} name={t.successRatePercent} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Opportunity Cost Alert */}
      {totalOpportunityCost > 1000 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-red-900 mb-2">⚠️ {t.highOpportunityCostWarning}</h3>
              <p className="text-red-700 mb-4">
                {t.opportunityCostMessage} <strong>${totalOpportunityCost.toFixed(0)}</strong> {t.opportunityCostMessage2} <strong>${(totalOpportunityCost * 2.5).toFixed(0)}</strong> {t.opportunityCostMessage3}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.dailyLoss}</p>
                  <p className="text-red-900 text-2xl">${totalOpportunityCost.toFixed(0)}</p>
                </div>
                <div className="flex-1 bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.monthlyLoss}</p>
                  <p className="text-red-900 text-2xl">${(totalOpportunityCost * 30).toFixed(0)}</p>
                </div>
                <div className="flex-1 bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-sm mb-1">{t.psychologicalLoss}</p>
                  <p className="text-red-900 text-2xl">${(totalOpportunityCost * 2.5).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
          <h4 className="text-gray-900 mb-2">{t.addNewTest}</h4>
          <p className="text-gray-600 text-sm">{t.addNewTestDesc}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingDown className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-gray-900 mb-2">{t.calculateOpportunityCost}</h4>
          <p className="text-gray-600 text-sm">{t.calculateOpportunityCostDesc}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="text-gray-900 mb-2">{t.statisticalValidation}</h4>
          <p className="text-gray-600 text-sm">{t.statisticalValidationDesc}</p>
        </div>
      </div>
    </div>
  );
}
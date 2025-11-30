import { useState } from 'react';
import { Menu, X, LayoutDashboard, Calculator, Lightbulb, Brain, BarChart3, Users, LogOut, Save, RefreshCw } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ICECalculator from './components/ICECalculator';
import TestIdeas from './components/TestIdeas';
import BehavioralEconomics from './components/BehavioralEconomics';
import StatisticalTools from './components/StatisticalTools';
import SegmentAnalysis from './components/SegmentAnalysis';
import AuthPage from './components/AuthPage';
import Logo from './components/ui/Logo';
import { Language, translations } from './types/translations';
import { useTestIdeas } from './hooks/useTestIdeas';
import { useAuth } from './hooks/useAuth';

type AuthView = 'login' | 'signup' | 'app' | 'guest';

export type TestIdea = {
  id: string;
  name: string;
  impact: number;
  confidence: number;
  ease: number;
  iceScore: number;
  currentConversionRate: number;
  expectedImprovement: number;
  monthlyTraffic: number;
  status: 'planned' | 'running' | 'completed';
  createdAt: string;
  testDuration?: number;
  actualResult?: number;
  synced?: boolean; // Supabase와 동기화 여부 (로컬 전용 필드)
};


export default function App() {
  const [authView, setAuthView] = useState<AuthView>('app');
  const [language, setLanguage] = useState<Language>('ko');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Supabase Hooks
  const { 
    user, 
    signIn: authSignIn, 
    signUp: authSignUp, 
    signOut: authSignOut
  } = useAuth({ language });

  const {
    testIdeas,
    addTestIdea: addIdea,
    updateTestIdea: updateIdea,
    deleteTestIdea: deleteIdea,
    isOnline: ideasOnline
  } = useTestIdeas({ language, autoLoad: true });

  console.log('🟢 App.tsx - testIdeas 개수:', testIdeas.length);
  console.log('🟢 App.tsx - testIdeas:', testIdeas);

  const t = translations[language];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleResetData = () => {
    if (window.confirm(language === 'ko' 
      ? '모든 로컬 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.' 
      : 'Are you sure you want to reset all local data? This action cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem('testIdeas');
      localStorage.removeItem('guestUser');
      setHasUnsavedChanges(false);
      // Reload page to refresh from Supabase
      window.location.reload();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'ice', label: t.iceCalculator, icon: Calculator },
    { id: 'ideas', label: t.testIdeas, icon: Lightbulb },
    { id: 'behavioral', label: t.behavioralEconomics, icon: Brain },
    { id: 'statistical', label: t.statisticalTools, icon: BarChart3 },
    { id: 'segment', label: t.segmentAnalysis, icon: Users }
  ];

  // Test Ideas 관리 함수들은 useTestIdeas Hook에서 제공
  const handleAddTestIdea = async (idea: Omit<TestIdea, 'id' | 'iceScore' | 'createdAt' | 'status'>) => {
    try {
      await addIdea(idea);
    } catch (error) {
      console.error('Failed to add test idea:', error);
    }
  };

  const handleUpdateTestIdea = async (id: string, updates: Partial<TestIdea>) => {
    try {
      await updateIdea(id, updates);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update test idea:', error);
    }
  };

  const handleDeleteTestIdea = async (id: string) => {
    try {
      await deleteIdea(id);
    } catch (error) {
      console.error('Failed to delete test idea:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard testIdeas={testIdeas} language={language} />;
      case 'ice':
        return <ICECalculator onAddTestIdea={handleAddTestIdea} language={language} />;
      case 'ideas':
        return (
          <TestIdeas 
            testIdeas={testIdeas}
            onUpdate={handleUpdateTestIdea}
            onDelete={handleDeleteTestIdea}
            language={language}
          />
        );
      case 'behavioral':
        return <BehavioralEconomics testIdeas={testIdeas} language={language} onNavigateToICE={() => setActiveTab('ice')} />;
      case 'statistical':
        return <StatisticalTools language={language} />;
      case 'segment':
        return <SegmentAnalysis language={language} />;
      default:
        return <Dashboard testIdeas={testIdeas} language={language} />;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await authSignIn(email, password);
      setShowAuthModal(false);
      setAuthView('app');
    } catch (error: any) {
      alert(language === 'ko' 
        ? `로그인 실패: ${error.message || '다시 시도해주세요'}` 
        : `Login failed: ${error.message || 'Please try again'}`
      );
    }
  };

  const handleSignup = async (name: string, email: string, password: string, company: string) => {
    try {
      await authSignUp(email, password, name, company);
      setShowAuthModal(false);
      setAuthView('app');
      alert(language === 'ko' 
        ? '회원가입이 완료되었습니다!' 
        : 'Signup successful!'
      );
    } catch (error: any) {
      alert(language === 'ko' 
        ? `회원가입 실패: ${error.message || '다시 시도해주세요'}` 
        : `Signup failed: ${error.message || 'Please try again'}`
      );
    }
  };

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
      setAuthView('login');
      setHasUnsavedChanges(false);
    } catch (error: any) {
      alert(language === 'ko' 
        ? '로그아웃 실패' 
        : 'Logout failed'
      );
    }
  };

  const handleSave = () => {
    // Supabase는 자동으로 저장됨
    if (!user) {
      alert(language === 'ko' ? '저장하려면 로그인이 필요합니다.' : 'Login required to save.');
      return;
    }
    setHasUnsavedChanges(false);
    alert(language === 'ko' 
      ? 'Supabase에 자동으로 저장되었습니다!' 
      : 'Automatically saved to Supabase!'
    );
  };

  const handleGuestContinue = () => {
    setAuthView('app');
  };

  // Show auth pages if not logged in
  if (authView === 'login') {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSignupClick={() => setAuthView('signup')}
        onGuestContinue={handleGuestContinue}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  if (authView === 'signup') {
    return (
      <AuthPage
        onSignup={handleSignup}
        onLoginClick={() => setAuthView('login')}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // Main app
  return (
    <div className="flex h-screen gradient-background">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 glass-strong border-r border-[#e8e1d9] overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Logo />
            <h1 className="text-[#4a4237]" style={{ fontFamily: 'Playfair Display, serif' }}>A/B Test Hub</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover-lift ${
                    activeTab === item.id
                      ? 'gradient-primary text-white shadow-earth'
                      : 'text-[#6b5d52] hover:bg-white/50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout (at bottom of sidebar) */}
          {user && (
            <div className="mt-8 pt-4 border-t border-[#e8e1d9]">
              <div className="px-4 py-3 bg-white/50 rounded-xl mb-2">
                <p className="text-[#4a4237] text-sm truncate">{user.profile.name}</p>
                <p className="text-[#8b7d6b] text-xs truncate">{user.profile.company || 'No Company'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-[#d4a08a] hover:bg-white/50 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="mt-8 pt-4 border-t border-[#e8e1d9]">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all cursor-pointer"
              >
                <p className="text-yellow-800 text-xs">
                  {language === 'ko' ? '게스트 모드' : 'Guest Mode'}
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  {language === 'ko' ? '로그인하여 저장하기' : 'Log in to save'}
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-strong border-b border-[#e8e1d9] px-6 py-4 shadow-earth">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/70 rounded-lg transition-all hover-lift"
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-[#4a4237]" /> : <Menu className="w-5 h-5 text-[#4a4237]" />}
              </button>
              <div>
                <h2 className="text-[#4a4237]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-[#6b5d52] text-sm">
                  {language === 'ko' 
                    ? 'ICE 프레임워크로 테스트 우선순위를 결정하세요'
                    : 'Prioritize your tests with ICE framework'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Online/Offline Status Indicator */}
              {!ideasOnline && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-700 text-xs font-medium">
                    {language === 'ko' ? 'localStorage 모드' : 'localStorage Mode'}
                  </span>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white rounded-lg transition-all hover-lift border border-gray-200"
                title={language === 'ko' ? '데이터 초기화' : 'Reset Data'}
              >
                <RefreshCw className="w-4 h-4" style={{ color: '#a89075' }} />
                <span className="text-sm" style={{ color: '#6b5d52' }}>
                  {language === 'ko' ? '초기화' : 'Reset'}
                </span>
              </button>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-white/50 rounded-full p-1">
                <button
                  onClick={() => handleLanguageChange('ko')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    language === 'ko' 
                      ? 'gradient-primary text-white' 
                      : 'text-[#6b5d52] hover:bg-white'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    language === 'en' 
                      ? 'gradient-primary text-white' 
                      : 'text-[#6b5d52] hover:bg-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Save Button */}
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl hover-lift shadow-earth"
                  disabled={!user}
                >
                  <Save className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              )}

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="text-right">
                      <p className="text-[#4a4237] text-sm">{user.profile.name}</p>
                      <p className="text-[#8b7d6b] text-xs">{user.profile.company || 'No Company'}</p>
                    </div>
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white shadow-earth">
                      {user.profile.name.charAt(0).toUpperCase()}
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-3 hover:bg-white/50 rounded-xl p-2 transition-all hover-lift"
                  >
                    <div className="text-right">
                      <p className="text-[#4a4237] text-sm">{language === 'ko' ? '게스트' : 'Guest'}</p>
                      <p className="text-[#8b7d6b] text-xs">{language === 'ko' ? '로그인하기' : 'Log in'}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#e8e1d9] rounded-full flex items-center justify-center text-[#6b5d52] shadow-earth">
                      ?
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <AuthPage
              onLogin={handleLogin}
              onSignupClick={() => setAuthView('signup')}
              onGuestContinue={() => setShowAuthModal(false)}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
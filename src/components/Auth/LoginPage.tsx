import { useState } from 'react';
import { Mail, Lock, Globe } from 'lucide-react';
import Logo from '../ui/Logo';
import { Language, translations } from '../../types/translations';

type LoginPageProps = {
  onLogin: (email: string, password: string) => void;
  onSignupClick: () => void;
  onGuestContinue: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
};

export default function LoginPage({ 
  onLogin, 
  onSignupClick, 
  onGuestContinue,
  language,
  onLanguageChange 
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen gradient-background flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #a89075 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <div className="glass-strong rounded-full p-2 flex items-center gap-2 shadow-earth">
          <button
            onClick={() => onLanguageChange('ko')}
            className={`px-4 py-2 rounded-full transition-all ${
              language === 'ko' 
                ? 'gradient-primary text-white' 
                : 'text-[#6b5d52] hover:bg-white/50'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-4 py-2 rounded-full transition-all ${
              language === 'en' 
                ? 'gradient-primary text-white' 
                : 'text-[#6b5d52] hover:bg-white/50'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="glass-strong rounded-2xl p-8 md:p-12 shadow-earth-hover max-w-md w-full relative z-10 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl p-4 mx-auto mb-4 shadow-earth text-white">
            <Logo size="lg" />
          </div>
          <h1 className="text-[#4a4237] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            A/B Test Hub
          </h1>
          <p className="text-[#6b5d52]">
            {language === 'ko' 
              ? 'ICE 프레임워크로 테스트 우선순위를 결정하세요'
              : 'Prioritize your tests with ICE framework'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#4a4237] mb-2">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7d6b]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'ko' ? '이메일을 입력하세요' : 'Enter your email'}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#e8e1d9] rounded-xl focus:outline-none focus:border-[#c9b5a0] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4a4237] mb-2">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7d6b]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'ko' ? '비밀번호를 입력하세요' : 'Enter your password'}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#e8e1d9] rounded-xl focus:outline-none focus:border-[#c9b5a0] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-primary text-white py-3 rounded-xl hover-lift shadow-earth"
          >
            {t.loginButton}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#e8e1d9]" />
          <span className="text-[#8b7d6b] text-sm">OR</span>
          <div className="flex-1 h-px bg-[#e8e1d9]" />
        </div>

        {/* Guest Continue */}
        <button
          onClick={onGuestContinue}
          className="w-full bg-white border-2 border-[#c9b5a0] text-[#4a4237] py-3 rounded-xl hover-lift hover:gradient-primary hover:text-white hover:border-transparent transition-all"
        >
          {t.loginAsGuest}
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-[#6b5d52]">
            {t.dontHaveAccount}{' '}
            <button
              onClick={onSignupClick}
              className="text-[#a89075] hover:text-[#c9b5a0] transition-colors"
            >
              {t.signup}
            </button>
          </p>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-blue-800 text-sm text-center font-medium">
            {language === 'ko' 
              ? '💡 게스트 모드: 브라우저에 데이터가 저장됩니다 (localStorage)'
              : '💡 Guest Mode: Data is saved in your browser (localStorage)'}
          </p>
          <p className="text-blue-600 text-xs text-center mt-1">
            {language === 'ko' 
              ? '로그인하면 클라우드에 안전하게 저장되고 여러 기기에서 접근 가능합니다'
              : 'Login to save securely in the cloud and access from multiple devices'}
          </p>
        </div>
      </div>
    </div>
  );
}
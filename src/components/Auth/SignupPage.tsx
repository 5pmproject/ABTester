import { useState } from 'react';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import Logo from '../ui/Logo';
import { Language, translations } from '../../types/translations';

type SignupPageProps = {
  onSignup: (name: string, email: string, password: string, company: string) => void;
  onLoginClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
};

export default function SignupPage({ 
  onSignup, 
  onLoginClick,
  language,
  onLanguageChange 
}: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(language === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.');
      return;
    }
    if (name && email && password && company) {
      onSignup(name, email, password, company);
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

      {/* Signup Card */}
      <div className="glass-strong rounded-2xl p-8 md:p-12 shadow-earth-hover max-w-md w-full relative z-10 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl p-4 mx-auto mb-4 shadow-earth text-white">
            <Logo size="lg" />
          </div>
          <h1 className="text-[#4a4237] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {language === 'ko' ? '회원가입' : 'Create Account'}
          </h1>
          <p className="text-[#6b5d52]">
            {language === 'ko' 
              ? '데이터 저장을 위해 계정을 만드세요'
              : 'Create an account to save your data'}
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#4a4237] mb-2">
              {t.name}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7d6b]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'ko' ? '이름을 입력하세요' : 'Enter your name'}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#e8e1d9] rounded-xl focus:outline-none focus:border-[#c9b5a0] transition-colors"
                required
              />
            </div>
          </div>

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
              {t.company}
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7d6b]" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={language === 'ko' ? '회사명을 입력하세요' : 'Enter your company name'}
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
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4a4237] mb-2">
              {t.confirmPassword}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8b7d6b]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'ko' ? '비밀번호를 다시 입력하세요' : 'Confirm your password'}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#e8e1d9] rounded-xl focus:outline-none focus:border-[#c9b5a0] transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-primary text-white py-3 rounded-xl hover-lift shadow-earth mt-6"
          >
            {t.signupButton}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-[#6b5d52]">
            {t.alreadyHaveAccount}{' '}
            <button
              onClick={onLoginClick}
              className="text-[#a89075] hover:text-[#c9b5a0] transition-colors"
            >
              {t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
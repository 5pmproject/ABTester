import LoginPage from './Auth/LoginPage';
import SignupPage from './Auth/SignupPage';
import { Language } from '../types/translations';

type AuthPageProps = {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string, company: string) => void;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onGuestContinue?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
};

export default function AuthPage({
  onLogin,
  onSignup,
  onSignupClick,
  onLoginClick,
  onGuestContinue,
  language,
  onLanguageChange
}: AuthPageProps) {
  if (onLogin && onSignupClick && onGuestContinue) {
    return (
      <LoginPage
        onLogin={onLogin}
        onSignupClick={onSignupClick}
        onGuestContinue={onGuestContinue}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    );
  }

  if (onSignup && onLoginClick) {
    return (
      <SignupPage
        onSignup={onSignup}
        onLoginClick={onLoginClick}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    );
  }

  return null;
}

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'outline';

interface EarthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export default function EarthButton({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: EarthButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-xl transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'gradient-primary text-white shadow-earth',
    secondary: 'bg-[#e8e1d9] text-[#4a4237] hover:bg-[#c9b5a0] hover:text-white',
    success: 'bg-[#6b9b6b] text-white hover:bg-[#5a8a5a] shadow-earth',
    error: 'bg-[#d4a08a] text-white hover:bg-[#c38f79] shadow-earth',
    outline: 'border-2 border-[#c9b5a0] text-[#4a4237] hover:gradient-primary hover:text-white hover:border-transparent'
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

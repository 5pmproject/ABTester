import { ReactNode } from 'react';

interface EarthCardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export default function EarthCard({ 
  children, 
  className = '', 
  glass = false,
  hover = true 
}: EarthCardProps) {
  const baseStyles = 'rounded-xl p-6 shadow-earth border border-[#e8e1d9]';
  const glassStyles = glass ? 'glass' : 'bg-white';
  const hoverStyles = hover ? 'hover-lift' : '';

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}


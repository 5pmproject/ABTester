interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };

  const strokeWidths = {
    sm: '2',
    md: '2.5',
    lg: '3'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Minimalist A/B letters */}
        <g>
          {/* Letter A - left side */}
          <path
            d="M 25 70 L 35 30 L 45 70"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 28 55 L 42 55"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
          />
          
          {/* Divider line */}
          <path
            d="M 50 25 L 50 75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Letter B - right side */}
          <path
            d="M 58 30 L 58 70"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
          />
          <path
            d="M 58 30 C 65 30, 72 35, 72 42.5 C 72 50, 65 50, 58 50"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 58 50 C 66 50, 74 55, 74 62.5 C 74 70, 66 70, 58 70"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

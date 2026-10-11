import React from 'react';

interface HusnainLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'full' | 'horizontal' | 'mark';
}

export const HusnainLogo: React.FC<HusnainLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
  variant = 'horizontal'
}) => {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const ebookSizes = {
    sm: 'text-[9px] tracking-[4px]',
    md: 'text-[11px] tracking-[5px]',
    lg: 'text-[14px] tracking-[7px]',
    xl: 'text-[20px] tracking-[10px]'
  };

  const taglineSizes = {
    sm: 'text-[7px] tracking-[2px]',
    md: 'text-[8px] tracking-[3px]',
    lg: 'text-[11px] tracking-[4px]',
    xl: 'text-[14px] tracking-[5px]'
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      {/* Brand Monogram Badge */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 rounded-lg overflow-hidden border border-[#D4AF37]/30 bg-[#0A0C0E] shadow-lg group-hover:border-[#D4AF37]/60 transition-colors`}>
        <img 
          src="/brand-logo.svg" 
          alt="Husnain Ebooks Logo" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typography side */}
      {variant !== 'mark' && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-brand-crest font-extrabold text-white tracking-[2px] ${textSizes[size]}`}>
              HUSNAIN
            </span>
            <span className={`font-brand-crest font-bold text-[#D4AF37] ${ebookSizes[size]}`}>
              EBOOKS
            </span>
          </div>

          {showTagline && (
            <div className={`font-sans font-semibold text-[#D4AF37]/80 uppercase ${taglineSizes[size]} mt-0.5 flex items-center gap-1`}>
              <span>READ</span>
              <span className="text-[#D4AF37]">•</span>
              <span>LEARN</span>
              <span className="text-[#D4AF37]">•</span>
              <span>GROW</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

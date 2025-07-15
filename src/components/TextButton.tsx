'use client';

import { forwardRef } from 'react';

interface TextButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  variant?: 'small' | 'large';
  priority?: boolean;
  role?: string;
}

const TextButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, TextButtonProps>(function TextButton({ 
  children, 
  onClick, 
  className = '', 
  href,
  variant = 'small',
  priority = false,
  role,
  ...props
}, ref) {
  const sizeClasses = variant === 'large' 
    ? 'text-[24px] leading-normal font-semibold' 
    : 'text-xs sm:text-sm leading-normal';
    
  const weightClasses = variant === 'large' 
    ? 'font-[600]' 
    : '';
    
  const underlineClasses = priority 
    ? 'hover:decoration-[2px] focus:decoration-[2px] hover:underline-offset-[0.25em] focus:underline-offset-[0.25em]'
    : 'hover:decoration-from-font focus:decoration-from-font hover:underline-offset-[0.2em] focus:underline-offset-[0.2em]';

  const baseClasses = `${variant === 'large' ? weightClasses : 'font-semibold'} ${sizeClasses} cursor-pointer transition-all duration-200 hover:underline hover:decoration-solid ${underlineClasses} focus:outline-none focus:underline active:scale-95 ${className}`.trim();

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={baseClasses}
        role={role || "button"}
        tabIndex={0}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      className={baseClasses}
      type="button"
      role={role}
      {...props}
    >
      {children}
    </button>
  );
});

export default TextButton;
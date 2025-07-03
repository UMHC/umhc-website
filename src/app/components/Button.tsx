import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  ariaLabel,
  ariaDescribedBy,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        bg-[#b15539] relative rounded-[5px] text-[#fffefb] font-semibold text-[16px]
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green
        disabled:opacity-50 disabled:cursor-not-allowed
        active:transform active:scale-[0.98]
        hover:bg-[#a14a32]
        ${fullWidth ? 'w-full' : 'inline-block'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="absolute border-2 border-[#b15539] border-solid inset-[-1px] pointer-events-none rounded-md shadow-[0px_4px_4px_0px_rgba(0,0,0,0.09)]" />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-[15px] py-[5px] relative size-full">
          <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#fffefb] text-[16px] text-left text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              {children}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
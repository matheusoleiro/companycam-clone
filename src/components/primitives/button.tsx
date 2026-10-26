'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs font-medium rounded-sm',
    md: 'h-10 px-4 text-sm font-medium rounded-md',
    lg: 'h-12 px-5 text-base font-semibold rounded-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50',
    secondary: 'bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 disabled:opacity-50',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-sans
        transition-colors duration-base
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className || ''}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

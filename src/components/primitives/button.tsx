'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: icon ? 'p-2 h-8 w-8' : 'h-8 px-3 text-xs font-medium',
    md: icon ? 'p-2.5 h-10 w-10' : 'h-10 px-4 text-sm font-500',
    lg: icon ? 'p-3 h-12 w-12' : 'h-12 px-6 text-base font-600',
  };

  const variantClasses = {
    primary: `
      bg-[var(--color-accent-main)] text-white
      hover:bg-[var(--color-accent-dark)]
      active:bg-[var(--color-accent-dark)]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-smooth
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-[var(--color-surface)] text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      hover:border-[var(--color-border)] hover:bg-[var(--color-stone-200)]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-smooth
    `,
    ghost: `
      bg-transparent text-[var(--color-accent-main)]
      hover:bg-[var(--color-stone-100)]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-smooth
    `,
    danger: `
      bg-[var(--color-danger)] text-white
      hover:opacity-90
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-smooth
    `,
    success: `
      bg-[var(--color-success)] text-white
      hover:opacity-90
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-smooth
    `,
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-sans font-medium rounded-[var(--radius-md)]
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[var(--color-accent-main)]
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

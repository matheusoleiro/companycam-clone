'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  helperText,
  size = 'md',
  disabled = false,
  className,
  ...props
}: InputProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-900">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        disabled={disabled}
        className={`
          border border-slate-300 rounded-md font-sans
          placeholder:text-slate-500
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          transition-colors duration-base
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus-visible:outline-red-500' : ''}
          ${sizeClasses[size]}
          ${className || ''}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}

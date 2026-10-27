'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helpText,
  icon,
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
          {props.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          disabled={disabled}
          className={`
            w-full h-10 px-4
            rounded-[var(--radius-sm)]
            border border-[var(--color-border)]
            bg-[var(--color-bg)]
            text-[var(--color-text-primary)]
            text-sm font-500
            placeholder-[var(--color-text-muted)]
            transition-smooth
            focus:outline-none
            focus:border-[var(--color-accent-main)]
            focus:ring-3
            focus:ring-[rgba(var(--color-accent-main), 0.1)]
            disabled:opacity-60
            disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)]' : ''}
            ${icon ? 'pl-10' : ''}
            ${className || ''}
          `}
          {...props}
        />

        {icon && (
          <div className="absolute left-3 flex items-center justify-center text-[var(--color-text-muted)]">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--color-danger)] font-medium">
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {helpText}
        </p>
      )}
    </div>
  );
}

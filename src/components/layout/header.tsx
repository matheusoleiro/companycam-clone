'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/store/app';
import { Menu, HelpCircle, Settings } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { currentProject, user } = useApp();

  const title = 'CompanyCam';

  return (
    <header className="sticky top-0 bg-[var(--color-stone-100)] px-6 py-0 flex items-center justify-between h-12 border-b border-[var(--color-border)] flex-shrink-0">
      {/* Left: Hamburger + Title (mobile) / Logo (desktop) */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 hover:bg-[var(--color-stone-200)] rounded transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />
        </button>

        <button
          onClick={() => router.push('/projects')}
          className="hidden lg:flex hover:opacity-75 transition-opacity"
          aria-label="Go to projects"
        >
          <h1 className="text-sm font-600 text-[var(--color-text-primary)] tracking-tight">
            {title}
          </h1>
        </button>
      </div>

      {/* Right: Icon buttons (help + account) */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 hover:bg-[var(--color-stone-200)] rounded transition-colors text-[var(--color-text-muted)]"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          onClick={() => router.push('/settings')}
          className="p-2 hover:bg-[var(--color-stone-200)] rounded transition-colors text-[var(--color-text-muted)]"
          aria-label="Account & Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

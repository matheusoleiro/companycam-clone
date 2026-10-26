'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/store/app';
import { Menu } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { currentProject, user } = useApp();

  console.log('Header - currentProject:', currentProject);
  const title = currentProject ? currentProject.name : 'CompanyCam';

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between h-14">
      {/* Left: Back or Title */}
      <button
        onClick={() => router.push('/projects')}
        className="flex items-center gap-2 hover:opacity-75 transition-opacity"
        aria-label="Go to projects"
      >
        {currentProject && (
          <span className="p-2 hover:bg-slate-100 rounded-md">←</span>
        )}
        <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
      </button>

      {/* Right: Menu */}
      <button
        onClick={() => router.push('/settings')}
        className="p-2 hover:bg-slate-100 rounded-md"
        aria-label="Settings"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>
    </header>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/store/app';
import { FolderOpen, Settings } from 'lucide-react';

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedTab } = useApp();

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ] as const;

  const currentTab = tabs.find(t => pathname.includes(t.href))?.id || 'projects';

  const handleTabClick = (tab: typeof tabs[number]) => {
    setSelectedTab(tab.id as any);
    router.push(tab.href);
  };

  return (
    <nav className="sticky bottom-0 bg-[var(--color-stone-100)] border-t border-[var(--color-border)] px-0 py-2 flex items-center justify-around h-14 flex-shrink-0">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded transition-colors ${
              isActive
                ? 'text-[var(--color-accent-main)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-500">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

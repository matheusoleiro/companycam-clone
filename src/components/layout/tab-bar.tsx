'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/store/app';
import { FolderOpen, Zap, MessageCircle, Users, Settings } from 'lucide-react';

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedTab } = useApp();

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
    { id: 'feed', label: 'Feed', icon: Zap, href: '/feed' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat' },
    { id: 'team', label: 'Team', icon: Users, href: '/team' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ] as const;

  const currentTab = tabs.find(t => pathname.includes(t.href))?.id || 'projects';

  const handleTabClick = (tab: typeof tabs[number]) => {
    setSelectedTab(tab.id as any);
    router.push(tab.href);
  };

  return (
    <nav className="sticky bottom-0 bg-white border-t border-slate-200 px-0 py-2 flex items-center justify-around h-16">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors ${
              isActive
                ? 'text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/app';
import { Header } from './header';
import { TabBar } from './tab-bar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { user } = useApp();

  // TODO: Re-enable auth redirect after fixing Supabase session handling
  // if (!user) {
  //   router.push('/auth/login');
  //   return null;
  // }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Tab Bar (Bottom Navigation) */}
      <TabBar />
    </div>
  );
}

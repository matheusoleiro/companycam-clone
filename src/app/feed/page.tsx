'use client';

import { MainLayout } from '@/components/layout/main-layout';

export default function FeedPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Live Feed</h2>
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
          <div className="text-4xl mb-4">📺</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600">Real-time photo feed from your team will appear here.</p>
        </div>
      </div>
    </MainLayout>
  );
}

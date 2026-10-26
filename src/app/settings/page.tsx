'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useApp } from '@/store/app';
import { Button } from '@/components/primitives/button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>

        {/* Profile Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm text-slate-600">Name</label>
              <p className="text-slate-900 font-medium">{user?.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <p className="text-slate-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Subscription Tier</label>
              <p className="text-slate-900 font-medium capitalize">{user?.subscription_tier}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Storage Used</label>
              <p className="text-slate-900 font-medium">
                {((user?.storage_used_bytes || 0) / 1024 / 1024 / 1024).toFixed(2)} GB / {((user?.storage_limit_bytes || 0) / 1024 / 1024 / 1024).toFixed(0)} GB
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full text-left">
                Manage Subscription
              </Button>
              <Button variant="secondary" className="w-full text-left">
                Download Your Data
              </Button>
              <Button variant="danger" className="w-full" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

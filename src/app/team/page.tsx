'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useApp } from '@/store/app';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as data from '@/lib/data';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      const members = await data.getTeamMembers();
      setTeamMembers(members);
      setLoading(false);
    };
    loadTeam();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Team</h2>
          <div className="text-center py-16">Loading team...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Team Members</h2>
          <span className="text-sm text-slate-600">{teamMembers.length} members</span>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{member.full_name}</h3>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  member.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {member.status}
                </span>
                {member.clock_in_at && (
                  <span className="text-xs text-slate-600">Clocked in</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

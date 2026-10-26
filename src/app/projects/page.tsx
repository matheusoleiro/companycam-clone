'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/app';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Plus, Calendar, MapPin, Users, Trash2 } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoadingProjects, loadProjects, selectProject, deleteProject } = useApp();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await useApp.getState().createProject(newProjectName, newProjectAddress);
      setNewProjectName('');
      setNewProjectAddress('');
      setShowNewProjectModal(false);
      await loadProjects();
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectProject = async (id: string) => {
    await selectProject(id);
    router.push(`/projects/${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Tem certeza que quer deletar este projeto?')) {
      setDeletingId(id);
      try {
        await deleteProject(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoadingProjects) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-slate-600">Loading projects...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with Action */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowNewProjectModal(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </div>

        {/* Projects List or Empty State */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to start documenting work.</p>
            <Button
              variant="primary"
              onClick={() => setShowNewProjectModal(true)}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all flex flex-col"
              >
                {/* Header with Title and Delete Button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">{project.name}</h3>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingId === project.id}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50 flex-shrink-0"
                    title="Deletar projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Badge */}
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded mb-3 w-fit ${
                  project.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : project.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {project.status}
                </span>

                {/* Location */}
                {project.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{project.address}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>

                {/* Stats */}
                <div className="border-t border-slate-100 pt-3 mb-4 flex-1">
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-900">{project.photo_count}</span>
                      <span>photos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span><span className="font-medium text-slate-900">{project.crew_ids?.length || 0}</span> crew</span>
                    </div>
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => handleSelectProject(project.id)}
                  className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Open Project
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Project name *
                </label>
                <input
                  type="text"
                  placeholder="Roof replacement, HVAC upgrade, etc."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="123 Main St, Springfield, IL"
                  value={newProjectAddress}
                  onChange={(e) => setNewProjectAddress(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={isCreating}
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

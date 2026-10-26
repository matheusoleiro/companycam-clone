import { create } from 'zustand';
import { User, Project, Photo } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;

  // Projects
  projects: Project[];
  currentProject: Project | null;
  isLoadingProjects: boolean;
  loadProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  clearCurrentProject: () => void;
  createProject: (name: string, address?: string) => Promise<Project>;
  updateProject: (id: string, name: string, address?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Photos
  photos: Photo[];
  isLoadingPhotos: boolean;
  selectedPhotos: Set<string>;
  loadPhotos: (projectId: string) => Promise<void>;
  uploadPhoto: (projectId: string, file: File, location?: { latitude?: number; longitude?: number }) => Promise<Photo>;
  updatePhoto: (id: string, name: string) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  selectPhoto: (id: string, selected: boolean) => void;
  clearSelectedPhotos: () => void;

  // UI State
  selectedTab: 'projects' | 'feed' | 'chat' | 'team' | 'settings';
  setSelectedTab: (tab: 'projects' | 'feed' | 'chat' | 'team' | 'settings') => void;
}

export const useApp = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticating: false,
  login: async (email, password) => {
    set({ isAuthenticating: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      set({ user: data.user, isAuthenticating: false });
    } catch (error) {
      set({ isAuthenticating: false });
      throw error;
    }
  },
  signup: async (email, password, fullName) => {
    set({ isAuthenticating: true });
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      set({ user: data.user, isAuthenticating: false });
    } catch (error) {
      set({ isAuthenticating: false });
      throw error;
    }
  },
  logout: () => {
    set({ user: null, currentProject: null, projects: [], photos: [] });
  },

  // Projects
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  loadProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      set({ projects: data.projects, isLoadingProjects: false });
    } catch (error) {
      set({ isLoadingProjects: false });
      throw error;
    }
  },
  selectProject: async (id) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === id);
    if (project) {
      set({ currentProject: project });
      await get().loadPhotos(id);
    }
  },
  clearCurrentProject: () => {
    set({ currentProject: null, photos: [] });
  },
  createProject: async (name, address) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        address: address || null,
        start_date: new Date().toISOString().split('T')[0],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    set(state => ({ projects: [...state.projects, data.project] }));
    return data.project;
  },
  updateProject: async (id, name, address) => {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    set(state => ({
      projects: state.projects.map(p => p.id === id ? data.project : p),
      currentProject: state.currentProject?.id === id ? data.project : state.currentProject,
    }));
  },
  deleteProject: async (id) => {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  // Photos
  photos: [],
  isLoadingPhotos: false,
  selectedPhotos: new Set(),
  loadPhotos: async (projectId) => {
    set({ isLoadingPhotos: true });
    try {
      const response = await fetch(`/api/photos?projectId=${projectId}`);
      const data = await response.json();
      console.log('loadPhotos response:', { status: response.status, data });
      if (!response.ok) throw new Error(data.error);
      set({ photos: data.photos || [], isLoadingPhotos: false });
    } catch (error) {
      console.error('loadPhotos error:', error);
      set({ photos: [], isLoadingPhotos: false });
      throw error;
    }
  },
  uploadPhoto: async (projectId, file, location) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('capturedAt', new Date().toISOString());

    if (location?.latitude) formData.append('latitude', location.latitude.toString());
    if (location?.longitude) formData.append('longitude', location.longitude.toString());

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    const photo = data.photo;
    set(state => ({
      photos: [photo, ...state.photos],
      currentProject: state.currentProject
        ? { ...state.currentProject, photo_count: state.currentProject.photo_count + 1 }
        : null,
    }));
    return photo;
  },
  updatePhoto: async (id, name) => {
    const response = await fetch(`/api/photos?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    set(state => ({
      photos: state.photos.map(p => p.id === id ? data.photo : p),
    }));
  },
  deletePhoto: async (id) => {
    const response = await fetch(`/api/photos?id=${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    set(state => ({
      photos: state.photos.filter(p => p.id !== id),
      currentProject: state.currentProject
        ? { ...state.currentProject, photo_count: Math.max(0, state.currentProject.photo_count - 1) }
        : null,
    }));
  },
  selectPhoto: (id, selected) => {
    set(state => {
      const newSelected = new Set(state.selectedPhotos);
      if (selected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return { selectedPhotos: newSelected };
    });
  },
  clearSelectedPhotos: () => {
    set({ selectedPhotos: new Set() });
  },

  // UI State
  selectedTab: 'projects',
  setSelectedTab: (tab) => {
    set({ selectedTab: tab });
  },
}));

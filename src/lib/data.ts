import {
  User, Project, Photo, Comment, TeamMember, Checklist, Document, Report
} from '@/types';
import {
  seedUser, seedProjects, seedPhotos, seedComments, seedTeamMembers
} from './seed-data';

// Fake in-memory data store
let appState = {
  currentUser: seedUser,
  projects: seedProjects,
  photos: seedPhotos,
  comments: seedComments,
  teamMembers: seedTeamMembers,
};

// Auth
export async function login(email: string, password: string) {
  // Simulate API call
  await new Promise(r => setTimeout(r, 500));
  return { user: appState.currentUser, access_token: 'fake-token-123', expires_in: 3600 };
}

export async function signup(email: string, password: string, fullName: string) {
  await new Promise(r => setTimeout(r, 500));
  const newUser: User = {
    id: 'user-' + Math.random(),
    email,
    full_name: fullName,
    subscription_tier: 'free',
    subscription_status: 'trial',
    storage_used_bytes: 0,
    storage_limit_bytes: 1099511627776,
    created_at: new Date().toISOString(),
  };
  appState.currentUser = newUser;
  return { user: newUser, access_token: 'fake-token-123', expires_in: 3600 };
}

export async function getCurrentUser(): Promise<User | null> {
  return appState.currentUser;
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await new Promise(r => setTimeout(r, 300));
  return appState.projects;
}

export async function getProject(id: string): Promise<Project | null> {
  await new Promise(r => setTimeout(r, 200));
  return appState.projects.find(p => p.id === id) || null;
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  await new Promise(r => setTimeout(r, 500));
  const project: Project = {
    id: 'proj-' + Math.random().toString(36),
    user_id: appState.currentUser.id,
    name: data.name || 'Untitled Project',
    description: data.description,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    status: 'active',
    start_date: data.start_date || new Date().toISOString().split('T')[0],
    end_date: data.end_date,
    photo_count: 0,
    document_count: 0,
    crew_ids: data.crew_ids || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  appState.projects.push(project);
  return project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  await new Promise(r => setTimeout(r, 300));
  const project = appState.projects.find(p => p.id === id);
  if (!project) throw new Error('Project not found');
  Object.assign(project, data, { updated_at: new Date().toISOString() });
  return project;
}

// Photos
export async function getPhotos(projectId: string): Promise<Photo[]> {
  await new Promise(r => setTimeout(r, 300));
  return appState.photos.filter(p => p.project_id === projectId);
}

export async function getPhoto(id: string): Promise<Photo | null> {
  await new Promise(r => setTimeout(r, 200));
  return appState.photos.find(p => p.id === id) || null;
}

export async function uploadPhoto(projectId: string, file: File, metadata: Partial<Photo>): Promise<Photo> {
  await new Promise(r => setTimeout(r, 1000));
  const photo: Photo = {
    id: 'photo-' + Math.random().toString(36),
    project_id: projectId,
    uploaded_by_id: appState.currentUser.id,
    storage_path: `projects/${projectId}/${file.name}`,
    file_size: file.size,
    mime_type: file.type,
    width: metadata.width,
    height: metadata.height,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    captured_at: metadata.captured_at || new Date().toISOString(),
    is_video: file.type.startsWith('video/'),
    is_synced: true,
    is_pending_upload: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  appState.photos.push(photo);

  const project = appState.projects.find(p => p.id === projectId);
  if (project) {
    project.photo_count += 1;
    project.total_storage_used += file.size;
    project.updated_at = new Date().toISOString();
  }

  appState.currentUser.storage_used_bytes += file.size;
  return photo;
}

export async function deletePhoto(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 300));
  const photo = appState.photos.find(p => p.id === id);
  if (!photo) throw new Error('Photo not found');

  appState.photos = appState.photos.filter(p => p.id !== id);

  const project = appState.projects.find(p => p.id === photo.project_id);
  if (project) {
    project.photo_count -= 1;
    project.total_storage_used -= photo.file_size;
    project.updated_at = new Date().toISOString();
  }

  appState.currentUser.storage_used_bytes -= photo.file_size;
}

// Comments
export async function getComments(photoId?: string, projectId?: string): Promise<Comment[]> {
  await new Promise(r => setTimeout(r, 200));
  return appState.comments.filter(c =>
    (photoId && c.photo_id === photoId) || (projectId && c.project_id === projectId)
  );
}

export async function createComment(data: Partial<Comment>): Promise<Comment> {
  await new Promise(r => setTimeout(r, 300));
  const comment: Comment = {
    id: 'comment-' + Math.random().toString(36),
    photo_id: data.photo_id,
    project_id: data.project_id,
    user_id: appState.currentUser.id,
    text: data.text || '',
    mentions: data.mentions || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reactions: [],
  };
  appState.comments.push(comment);
  return comment;
}

export async function addReaction(commentId: string, emoji: string): Promise<Comment> {
  await new Promise(r => setTimeout(r, 200));
  const comment = appState.comments.find(c => c.id === commentId);
  if (!comment) throw new Error('Comment not found');

  const existing = comment.reactions.find(
    r => r.emoji === emoji && r.user_id === appState.currentUser.id
  );
  if (!existing) {
    comment.reactions.push({
      emoji,
      user_id: appState.currentUser.id,
      created_at: new Date().toISOString(),
    });
  }
  return comment;
}

// Team Members
export async function getTeamMembers(): Promise<TeamMember[]> {
  await new Promise(r => setTimeout(r, 200));
  return appState.teamMembers;
}

// Documents
export async function getDocuments(projectId: string): Promise<Document[]> {
  await new Promise(r => setTimeout(r, 200));
  return [];
}

// Reports
export async function createReport(projectId: string, data: Partial<Report>): Promise<Report> {
  await new Promise(r => setTimeout(r, 500));
  const report: Report = {
    id: 'report-' + Math.random().toString(36),
    project_id: projectId,
    created_by_id: appState.currentUser.id,
    title: data.title || 'Untitled Report',
    selected_photo_ids: data.selected_photo_ids || [],
    notes: data.notes,
    status: 'draft',
    created_at: new Date().toISOString(),
    sent_at: undefined,
  };
  return report;
}

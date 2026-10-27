// User & Auth
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'core' | 'crew' | 'scale' | 'enterprise';
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled';
  storage_used_bytes: number;
  storage_limit_bytes: number;
  created_at: string;
  timezone?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  expires_in: number;
}

// Team
export interface TeamMember {
  id: string;
  user_id: string;
  account_id: string;
  full_name: string;
  email: string;
  role: 'contractor' | 'crew_member' | 'supervisor' | 'admin';
  status: 'active' | 'inactive' | 'pending_invite';
  clock_in_at?: string;
  total_hours_today: number;
  last_activity_at?: string;
}

// Projects
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'archived' | 'completed';
  start_date: string;
  end_date?: string;
  photo_count: number;
  document_count: number;
  crew_ids: string[];
  created_at: string;
  updated_at: string;
}

// Folders
export interface Folder {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  parent_folder_id?: string;
  created_at: string;
  updated_at: string;
}

// Photos
export interface Photo {
  id: string;
  project_id: string;
  folder_id?: string;
  uploaded_by_id: string;
  storage_path: string;
  public_url?: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  latitude?: number;
  longitude?: number;
  captured_at: string;
  is_video: boolean;
  is_synced: boolean;
  is_pending_upload: boolean;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  photo_id: string;
  type: 'pin' | 'measure' | 'draw' | 'text' | 'voice';
  coordinates: Record<string, number>;
  label?: string;
  measurement_value?: number;
  measurement_unit?: 'ft' | 'm' | 'sq_ft' | 'sq_m';
  voice_transcript?: string;
  created_by_id: string;
  created_at: string;
}

// Comments
export interface Comment {
  id: string;
  photo_id?: string;
  project_id?: string;
  user_id: string;
  text: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  user_id: string;
  created_at: string;
}

// Checklists (Crew+)
export interface Checklist {
  id: string;
  project_id: string;
  created_by_id: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  due_date?: string;
  items: ChecklistItem[];
  created_at: string;
  completed_at?: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_by_id?: string;
  completed_at?: string;
  required: boolean;
  order_index: number;
}

// Tags
export interface Tag {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface PhotoTag {
  photo_id: string;
  tag_id: string;
}

// Documents
export interface Document {
  id: string;
  project_id: string;
  uploaded_by_id: string;
  title: string;
  storage_path: string;
  file_type: 'pdf' | 'image' | 'scan';
  file_size: number;
  source: 'upload' | 'scan' | 'external_link';
  created_at: string;
  is_archived: boolean;
}

// Reports
export interface Report {
  id: string;
  project_id: string;
  created_by_id: string;
  title: string;
  selected_photo_ids: string[];
  notes?: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  pdf_storage_path?: string;
  share_token?: string;
  created_at: string;
  sent_at?: string;
}

// Proposals (Scale+)
export interface Proposal {
  id: string;
  project_id: string;
  created_by_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  deposit_requested_cents?: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  line_items: ProposalLineItem[];
  share_token?: string;
  created_at: string;
  sent_at?: string;
}

export interface ProposalLineItem {
  id: string;
  proposal_id: string;
  description: string;
  quantity: number;
  unit_cost_cents: number;
  markup_percent: number;
  calculated_amount_cents: number;
  is_taxable: boolean;
  photo_ids: string[];
  order_index: number;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'mention' | 'task_assigned' | 'photo_uploaded' | 'checklist_due' | 'comment' | 'reaction';
  related_entity_id?: string;
  related_entity_type?: string;
  content?: string;
  read_at?: string;
  created_at: string;
}

'use client';

import { useState } from 'react';
import { Folder as FolderIcon, ChevronRight, ChevronDown, Plus, Trash2, Edit2 } from 'lucide-react';
import { Folder } from '@/types';
import { getStrings } from '@/i18n/strings';

const strings = getStrings('en');

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId?: string;
  onSelectFolder: (folderId: string | undefined) => void;
  onCreateFolder: (name: string, parentFolderId?: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onUpdateFolder: (id: string, name: string) => Promise<void>;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolder,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) return;
    try {
      await onCreateFolder(newFolderName, parentId);
      setNewFolderName('');
      setCreatingParentId(null);
      if (parentId) {
        setExpandedFolders(new Set([...expandedFolders, parentId]));
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await onUpdateFolder(id, editingName);
      setEditingFolderId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const rootFolders = folders.filter(f => !f.parent_folder_id);

  const getChildFolders = (parentId: string) => {
    return folders.filter(f => f.parent_folder_id === parentId);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const children = getChildFolders(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
          }`}
        >
          {children.length > 0 && (
            <button
              onClick={() => toggleExpanded(folder.id)}
              className="p-0 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {children.length === 0 && <div className="w-4" />}

          <button
            onClick={() => onSelectFolder(folder.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <FolderIcon className="w-4 h-4 flex-shrink-0" />
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleUpdateFolder(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateFolder(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
                className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900"
              />
            ) : (
              <span className="text-sm flex-1 truncate">{folder.name}</span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingFolderId(folder.id);
              setEditingName(folder.name);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded transition-opacity"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteFolder(folder.id)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded transition-opacity"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {isExpanded && (
          <>
            {children.map(child => renderFolder(child, level + 1))}
            {creatingParentId === folder.id && (
              <div style={{ marginLeft: `${(level + 1) * 16}px` }} className="flex items-center gap-2 px-3 py-2">
                <Plus className="w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="New folder..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder(folder.id);
                    if (e.key === 'Escape') {
                      setCreatingParentId(null);
                      setNewFolderName('');
                    }
                  }}
                  onBlur={() => {
                    if (newFolderName.trim()) handleCreateFolder(folder.id);
                    else {
                      setCreatingParentId(null);
                      setNewFolderName('');
                    }
                  }}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900"
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          onSelectFolder(undefined);
        }}
        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedFolderId === undefined
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
      >
        All Photos
      </button>

      <button
        onClick={() => setCreatingParentId(null)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Folder
      </button>

      {creatingParentId === null && (
        <div className="flex items-center gap-2 px-3 py-2">
          <Plus className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setCreatingParentId(null);
                setNewFolderName('');
              }
            }}
            onBlur={() => {
              if (newFolderName.trim()) handleCreateFolder();
              else setNewFolderName('');
            }}
            className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900"
          />
        </div>
      )}

      <div className="mt-2 space-y-0">
        {rootFolders.map(folder => renderFolder(folder))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/store/app';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/primitives/button';
import { Plus, Loader, X, Trash2, Edit2, Download } from 'lucide-react';
import { PhotoViewer } from '@/components/photo-viewer';
import { FolderTree } from '@/components/folder-tree';
import { IMAGE_QUALITY, IMAGE_UPLOAD, type QualityLevel } from '@/config/image';
import { IMAGE_DISPLAY, STORAGE_UNITS } from '@/config/ui';
import { getStrings } from '@/i18n/strings';

const strings = getStrings('en');

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProject, photos, isLoadingPhotos, loadPhotos, uploadPhoto, updatePhoto, movePhotoToFolder, deletePhoto, selectProject, updateProject, folders, isLoadingFolders, loadFolders, createFolder, updateFolder, deleteFolder } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editName, setEditName] = useState(currentProject?.name || '');
  const [editAddress, setEditAddress] = useState(currentProject?.address || '');
  const [editDescription, setEditDescription] = useState(currentProject?.description || '');
  const [photoSortOrder, setPhotoSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isEditingPhotoName, setIsEditingPhotoName] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingPhotoName, setEditingPhotoName] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [lastSelectedPhotoId, setLastSelectedPhotoId] = useState<string | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const loadData = async () => {
        try {
          // Se não tiver currentProject, carrega os projetos primeiro
          if (!currentProject) {
            await selectProject(projectId);
          }
          await loadPhotos(projectId);
          await loadFolders(projectId);
        } catch (err) {
          console.error('Failed to load data:', err);
        }
      };
      loadData();
    }
  }, [projectId]);

  // Filter photos by selected folder
  const filteredPhotos = selectedFolderId
    ? photos.filter(p => p.folder_id === selectedFolderId)
    : photos;

  // Wrapper functions for FolderTree
  const handleSelectFolder = (folderId: string | undefined) => {
    setSelectedFolderId(folderId);
  };

  const handleCreateFolder = async (name: string, parentFolderId?: string) => {
    await createFolder(projectId, name, parentFolderId);
  };

  const handleUpdateFolder = async (id: string, name: string, parentFolderId?: string) => {
    await updateFolder(id, name, parentFolderId);
  };

  const handlePhotoSelect = (photoId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd + Click: toggle selection
      const newSelected = new Set(selectedPhotoIds);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedPhotoIds(newSelected);
      setLastSelectedPhotoId(photoId);
    } else if (event.shiftKey && lastSelectedPhotoId) {
      // Shift + Click: range selection
      const photoIds = sortedPhotos.map(p => p.id);
      const startIdx = photoIds.indexOf(lastSelectedPhotoId);
      const endIdx = photoIds.indexOf(photoId);
      const [minIdx, maxIdx] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];

      const newSelected = new Set(selectedPhotoIds);
      for (let i = minIdx; i <= maxIdx; i++) {
        newSelected.add(photoIds[i]);
      }
      setSelectedPhotoIds(newSelected);
      setLastSelectedPhotoId(photoId);
    } else {
      // Regular click on checkbox: toggle this photo
      const newSelected = new Set(selectedPhotoIds);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedPhotoIds(newSelected);
      setLastSelectedPhotoId(photoId);
    }
  };

  const moveSelectedPhotos = async (folderId: string | undefined) => {
    const updates = Array.from(selectedPhotoIds).map(photoId =>
      movePhotoToFolder(photoId, folderId)
    );
    await Promise.all(updates);
    setSelectedPhotoIds(new Set());
    setShowMoveMenu(false);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    const folder = folders.find(f => f.id === folderToDelete);
    const folderPhotos = photos.filter(p => p.folder_id === folderToDelete);

    if (folderPhotos.length > 0) {
      // Folder has photos - show confirmation
      setShowDeleteFolderConfirm(true);
      return;
    }

    // Folder is empty - delete it
    await deleteFolder(folderToDelete);
    setFolderToDelete(null);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    await deleteFolder(folderToDelete);
    setShowDeleteFolderConfirm(false);
    setFolderToDelete(null);
  };

  const compressImage = async (file: File, qualityLevel: QualityLevel): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          const quality = IMAGE_QUALITY[qualityLevel];
          const maxDim = quality.maxDimension;

          if (width > height) {
            if (width > maxDim) {
              height = (height * maxDim) / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = (width * maxDim) / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], `${file.name.split('.')[0]}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: file.lastModified,
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality.jpegQuality
          );
        };
        img.src = event.target?.result as string;
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length === 0) return;

    setPendingFiles(files);
    setShowQualityMenu(true);
  };

  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0) return;

    setShowQualityMenu(false);
    setIsUploading(true);
    setUploadProgress({ completed: 0, total: pendingFiles.length });

    try {
      // Compress all files
      const compressedFiles = await Promise.all(
        pendingFiles.map(file => compressImage(file, selectedQuality))
      );

      // Upload all files in parallel (batch size to avoid overwhelming server)
      for (let i = 0; i < compressedFiles.length; i += IMAGE_UPLOAD.batchSize) {
        const batch = compressedFiles.slice(i, i + IMAGE_UPLOAD.batchSize);
        await Promise.all(
          batch.map(async (file) => {
            await uploadPhoto(projectId, file, {});
            setUploadProgress(prev =>
              prev ? { ...prev, completed: prev.completed + 1 } : null
            );
          })
        );
      }

      setPendingFiles([]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    if (!confirm('Tem certeza que quer deletar esta foto?')) return;

    setIsDeleting(true);
    try {
      await deletePhoto(selectedPhoto.id);
      setSelectedPhoto(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !currentProject) return;

    try {
      await updateProject(currentProject.id, editName, editAddress || undefined, editDescription || undefined);
      setIsEditingProject(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleUpdatePhotoName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhotoId || !editingPhotoName.trim()) return;

    try {
      await updatePhoto(editingPhotoId, editingPhotoName);
      setIsEditingPhotoName(false);
      setEditingPhotoId(null);
    } catch (err) {
      console.error('Error updating photo name:', err);
    }
  };

  const downloadPhoto = (photo: any) => {
    const link = document.createElement('a');
    link.href = photo.public_url;
    link.download = photo.name || `photo-${photo.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPhotos = async () => {
    if (sortedPhotos.length === 0) return;

    try {
      setIsUploading(true);
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add each photo to the ZIP
      for (let i = 0; i < sortedPhotos.length; i++) {
        const photo = sortedPhotos[i];
        if (!photo.public_url) {
          console.warn(`Photo ${i + 1} has no public_url`);
          continue;
        }
        try {
          const response = await fetch(photo.public_url, {
            method: 'GET',
          });

          if (!response.ok) {
            console.warn(`Failed to fetch photo ${i + 1}`);
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          const fileName = `photo-${i + 1}.jpg`;
          zip.file(fileName, arrayBuffer);
        } catch (photoErr) {
          console.warn(`Error downloading photo ${i + 1}:`, photoErr);
        }
      }

      // Generate ZIP and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${currentProject?.name || 'photos'}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading photos:', err);
      alert('Erro ao baixar fotos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Sort photos based on selected order
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    const dateA = new Date(a.captured_at).getTime();
    const dateB = new Date(b.captured_at).getTime();
    return photoSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Se não tiver currentProject mas projectId existe, mostra a página mesmo assim
  // (isso evita loading infinito)
  const hasProject = currentProject || projectId;

  if (!hasProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-slate-600">Loading project...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-screen gap-4 px-4 py-6">
        {/* Sidebar with Folders */}
        <div className="w-56 border-r border-slate-200 pr-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Folders</h2>
          {isLoadingFolders ? (
            <div className="text-slate-600 text-sm">Loading folders...</div>
          ) : (
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleSelectFolder}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={async (id) => {
                setFolderToDelete(id);
                const folder = folders.find(f => f.id === id);
                const folderPhotos = photos.filter(p => p.folder_id === id);

                if (folderPhotos.length > 0) {
                  setShowDeleteFolderConfirm(true);
                } else {
                  await deleteFolder(id);
                }
              }}
              onUpdateFolder={handleUpdateFolder}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Project Header */}
        {currentProject && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{currentProject.name}</h1>
              <button
                onClick={() => {
                  setEditName(currentProject.name);
                  setEditAddress(currentProject.address || '');
                  setEditDescription(currentProject.description || '');
                  setIsEditingProject(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600"
                title="Editar projeto"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              {currentProject.address && (
                <p className="text-sm text-slate-600 mb-1">{currentProject.address}</p>
              )}
              {currentProject.start_date && (
                <p className="text-sm text-slate-600 mb-1">
                  {new Date(currentProject.start_date).toLocaleDateString()}
                </p>
              )}
              {currentProject.description && (
                <p className="text-slate-700 mb-3">{currentProject.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap sm:flex-nowrap">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Timeline
            </button>
            <select
              value={photoSortOrder}
              onChange={(e) => setPhotoSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 whitespace-nowrap"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
            </select>
            {sortedPhotos.length > 0 && (
              <button
                onClick={downloadAllPhotos}
                disabled={isUploading}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 disabled:opacity-50 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
                title={strings.photos.downloadAll}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{strings.photos.downloadAll}</span>
                <span className="sm:hidden">{strings.photos.download}</span>
              </button>
            )}
          </div>

          <input
            id="photo-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handlePhotoUpload}
            multiple
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 gap-1 sm:gap-2 flex items-center whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {isUploading ? (
              <span className="text-xs sm:text-sm">Uploading...</span>
            ) : (
              <span className="hidden sm:inline text-sm">{strings.photos.addPhotos}</span>
            )}
            {isUploading && (
              <span className="text-xs hidden sm:inline">{uploadProgress?.completed}/{uploadProgress?.total}</span>
            )}
          </button>
        </div>

        {/* Selected Photos Actions Bar */}
        {selectedPhotoIds.size > 0 && viewMode === 'timeline' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedPhotoIds.size} foto{selectedPhotoIds.size !== 1 ? 's' : ''} selecionada{selectedPhotoIds.size !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Mover para pasta
              </button>
              <button
                onClick={() => setSelectedPhotoIds(new Set())}
                className="px-3 py-1 bg-slate-300 text-slate-700 text-xs rounded hover:bg-slate-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {showMoveMenu && selectedPhotoIds.size > 0 && viewMode === 'timeline' && (
          <div className="mb-4 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-md">
            <p className="text-sm font-medium mb-2 text-white">Selecione a pasta:</p>
            <div className="space-y-1">
              <button
                onClick={() => moveSelectedPhotos(undefined)}
                className="block w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-sm text-white font-medium"
              >
                📁 All Photos (remover da pasta)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => moveSelectedPhotos(folder.id)}
                  className="block w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-sm text-white font-medium"
                >
                  📁 {folder.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photos Grid or Timeline */}
        {isLoadingPhotos ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : sortedPhotos.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No photos yet</h3>
            <p className="text-slate-600 mb-6">Start documenting this project by adding your first photo.</p>
            <input
              id="photo-upload-empty"
              type="file"
              accept="image/*,video/*"
              onChange={handlePhotoUpload}
              multiple
              style={{ display: 'none' }}
            />
            <button
              onClick={() => document.getElementById('photo-upload-empty')?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? `${strings.photos.uploadPhotos} ${uploadProgress?.completed}/${uploadProgress?.total}...` : strings.photos.addPhotos}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div>
            {selectedPhotoIds.size > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedPhotoIds.size} foto{selectedPhotoIds.size !== 1 ? 's' : ''} selecionada{selectedPhotoIds.size !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Mover para pasta
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIds(new Set())}
                    className="px-3 py-1 bg-slate-300 text-slate-700 text-xs rounded hover:bg-slate-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {showMoveMenu && selectedPhotoIds.size > 0 && viewMode === 'grid' && (
              <div className="mb-4 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-md">
                <p className="text-sm font-medium mb-2 text-white">Selecione a pasta:</p>
                <div className="space-y-1">
                  <button
                    onClick={() => moveSelectedPhotos(undefined)}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-sm text-white font-medium"
                  >
                    📁 All Photos (remover da pasta)
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => moveSelectedPhotos(folder.id)}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-sm text-white font-medium"
                    >
                      📁 {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPhotos.map((photo) => {
                const isSelected = selectedPhotoIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                    draggable
                    onDragStart={(e) => {
                      if (!isSelected) {
                        setSelectedPhotoIds(new Set([photo.id]));
                      }
                    }}
                    onDragEnd={() => {}}
                  >
                    <button
                      onClick={(e) => {
                        if (e.shiftKey || e.ctrlKey || e.metaKey) {
                          handlePhotoSelect(photo.id, e as any);
                        } else {
                          setSelectedPhotoIndex(sortedPhotos.indexOf(photo));
                          setPhotoViewerOpen(true);
                        }
                      }}
                      className="w-full block"
                    >
                      <div className="bg-slate-100 aspect-square overflow-hidden">
                        <img
                          src={photo.public_url || `${IMAGE_DISPLAY.placeholders.grid}?text=${photo.id.substring(0, 8)}`}
                          alt={`Project photo ${photo.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </button>

                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 bg-slate-900 rounded border border-slate-700 p-1 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoSelect(photo.id, e as any);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Overlay Status */}
                    {photo.is_pending_upload && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Pending sync</span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-slate-600 mt-2">
                      {new Date(photo.captured_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPhotos.map((photo) => {
              const isSelected = selectedPhotoIds.has(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`w-full flex gap-4 p-4 border rounded-lg hover:shadow-md transition-all text-left ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div
                    className="flex-shrink-0"
                    onClick={(e) => handlePhotoSelect(photo.id, e as any)}
                  >
                    <div className="relative">
                      <div className="w-24 h-24 bg-slate-100 rounded-md overflow-hidden cursor-pointer hover:opacity-80">
                        <img
                          src={photo.public_url || `${IMAGE_DISPLAY.placeholders.timeline}?text=${photo.id.substring(0, 8)}`}
                          alt={`Project photo ${photo.id}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className="absolute top-1 left-1 bg-slate-900 rounded border border-slate-700 p-1 cursor-pointer hover:bg-slate-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoSelect(photo.id, e as any);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="flex-1 flex flex-col justify-center text-left"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(photo.captured_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {(photo.file_size / STORAGE_UNITS.bytesToMB).toFixed(STORAGE_UNITS.decimalPlaces)} {strings.fileSize.mb}
                    </p>
                    {photo.is_pending_upload && (
                      <p className="text-xs text-amber-600 mt-1">Pending sync</p>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="absolute -top-10 right-0 flex gap-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="p-2 text-green-400 hover:text-green-300"
                  title={strings.photos.downloadPhoto}
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    setEditingPhotoId(selectedPhoto.id);
                    setEditingPhotoName(selectedPhoto.name || '');
                    setIsEditingPhotoName(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300"
                  title="Editar nome"
                >
                  <Edit2 className="w-6 h-6" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowFolderPicker(!showFolderPicker)}
                    className="p-2 text-yellow-400 hover:text-yellow-300"
                    title="Mover para pasta"
                  >
                    📁
                  </button>
                  {showFolderPicker && (
                    <div className="absolute right-0 top-10 bg-slate-800 text-white rounded-lg shadow-xl z-50 min-w-[200px] max-h-[300px] overflow-y-auto border border-slate-700">
                      <button
                        onClick={async () => {
                          await movePhotoToFolder(selectedPhoto.id, undefined);
                          setShowFolderPicker(false);
                          setSelectedPhoto(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-slate-700 border-b border-slate-700"
                      >
                        📁 All Photos
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={async () => {
                            await movePhotoToFolder(selectedPhoto.id, folder.id);
                            setShowFolderPicker(false);
                            setSelectedPhoto(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-slate-700 border-b border-slate-700"
                        >
                          📁 {folder.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDeletePhoto}
                  disabled={isDeleting}
                  className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                  title="Deletar foto"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 text-white hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <img
                src={selectedPhoto.public_url}
                alt="Photo"
                className={`max-h-[${IMAGE_DISPLAY.maxPhotoViewerHeight}] w-auto object-contain rounded-lg`}
              />
              <div className="text-white text-center mt-4">
                {selectedPhoto.name && (
                  <p className="font-semibold">{selectedPhoto.name}</p>
                )}
                <p>{new Date(selectedPhoto.captured_at).toLocaleString()}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quality Selection Modal */}
        {showQualityMenu && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md p-6 sm:p-8">
              <h2 className="text-2xl sm:text-xl font-bold text-slate-900 mb-2">{strings.photoQuality.title}</h2>
              <p className="text-base text-slate-600 mb-8">
                {strings.photoQuality.selected.replace('{count}', pendingFiles.length.toString())}
              </p>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setSelectedQuality('high')}
                  className={`w-full p-5 rounded-lg border-2 text-left transition-all ${
                    selectedQuality === 'high'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900">{strings.photoQuality.high.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{strings.photoQuality.high.description}</div>
                </button>

                <button
                  onClick={() => setSelectedQuality('medium')}
                  className={`w-full p-5 rounded-lg border-2 text-left transition-all ${
                    selectedQuality === 'medium'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900">{strings.photoQuality.medium.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{strings.photoQuality.medium.description}</div>
                </button>

                <button
                  onClick={() => setSelectedQuality('low')}
                  className={`w-full p-5 rounded-lg border-2 text-left transition-all ${
                    selectedQuality === 'low'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900">{strings.photoQuality.low.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{strings.photoQuality.low.description}</div>
                </button>
              </div>

              <div className="flex gap-3 flex-col-reverse sm:flex-row">
                <button
                  onClick={() => {
                    setShowQualityMenu(false);
                    setPendingFiles([]);
                  }}
                  className="flex-1 px-4 py-3 sm:py-2 text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 font-semibold text-base sm:text-sm"
                >
                  {strings.actions.cancel}
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base sm:text-sm disabled:opacity-50"
                >
                  {isUploading ? `${strings.actions.loading}` : strings.photoQuality.confirm}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {isEditingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Editar Projeto</h2>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nome do projeto"
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="123 Main St, Springfield, IL"
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descrição do projeto"
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="flex-1 px-4 py-2 text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Photo Name Modal */}
        {isEditingPhotoName && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Editar Nome da Foto</h2>
              <form onSubmit={handleUpdatePhotoName} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editingPhotoName}
                    onChange={(e) => setEditingPhotoName(e.target.value)}
                    placeholder="Digite um nome para a foto"
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhotoName(false);
                      setEditingPhotoId(null);
                    }}
                    className="flex-1 px-4 py-2 text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

            {/* Photo Viewer */}
            <PhotoViewer
              photos={filteredPhotos}
              initialIndex={selectedPhotoIndex}
              isOpen={photoViewerOpen}
              onClose={() => setPhotoViewerOpen(false)}
            />
          </div>
        </div>

        {/* Delete Folder Confirmation Modal */}
        {showDeleteFolderConfirm && folderToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-white mb-2">Deletar pasta com arquivos?</h2>
              <p className="text-slate-300 mb-6">
                Você realmente deseja deletar esta pasta? Os arquivos serão perdidos.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteFolderConfirm(false);
                    setFolderToDelete(null);
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteFolder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/store/app';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/primitives/button';
import { Plus, Loader, X, Trash2, Edit2, Download } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProject, photos, isLoadingPhotos, loadPhotos, uploadPhoto, updatePhoto, deletePhoto, selectProject, updateProject } = useApp();
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

  useEffect(() => {
    if (projectId) {
      const loadData = async () => {
        try {
          // Se não tiver currentProject, carrega os projetos primeiro
          if (!currentProject) {
            await selectProject(projectId);
          }
          await loadPhotos(projectId);
        } catch (err) {
          console.error('Failed to load data:', err);
        }
      };
      loadData();
    }
  }, [projectId]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Limit max dimension to 2048px (medium quality iPhone)
          const maxDim = 2048;
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

          // Convert to JPEG with 75% quality (medium)
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
            0.75
          );
        };
        img.src = event.target?.result as string;
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: files.length });

    try {
      // Compress all files first
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      // Upload all files in parallel (5 at a time to avoid overwhelming server)
      const batchSize = 5;
      for (let i = 0; i < compressedFiles.length; i += batchSize) {
        const batch = compressedFiles.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (file) => {
            await uploadPhoto(projectId, file, {});
            setUploadProgress(prev =>
              prev ? { ...prev, completed: prev.completed + 1 } : null
            );
          })
        );
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Reset input
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
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
        try {
          const response = await fetch(photo.public_url, {
            method: 'GET',
          });

          if (!response.ok) {
            console.warn(`Failed to fetch photo ${i + 1}`);
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          const fileName = `${photo.name || `photo-${i + 1}`}.jpg`;
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
  const sortedPhotos = [...photos].sort((a, b) => {
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
      <div className="max-w-6xl mx-auto px-4 py-6">
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
              className="px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
            </select>
            {sortedPhotos.length > 0 && (
              <button
                onClick={downloadAllPhotos}
                disabled={isUploading}
                className="px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 disabled:opacity-50 flex items-center gap-2"
                title="Baixar todas as fotos em ZIP"
              >
                <Download className="w-4 h-4" />
                Baixar Tudo
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 gap-2 flex items-center"
          >
            <Plus className="w-5 h-5" />
            {isUploading ? (
              <>
                Uploading {uploadProgress?.completed}/{uploadProgress?.total}...
              </>
            ) : (
              'Add Photos'
            )}
          </button>
        </div>

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
              {isUploading ? `Adding Photos ${uploadProgress?.completed}/${uploadProgress?.total}...` : 'Add Photos'}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="w-full block"
                >
                  <div className="bg-slate-100 aspect-square rounded-lg overflow-hidden cursor-pointer">
                    <img
                      src={photo.public_url || `https://via.placeholder.com/300?text=${photo.id.substring(0, 8)}`}
                      alt={`Project photo ${photo.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </button>

                {/* Overlay Status */}
                {photo.is_pending_upload && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white text-xs font-medium">Pending sync</span>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-slate-600 mt-2">
                  {new Date(photo.captured_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="w-full flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow text-left"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-md flex-shrink-0">
                  <img
                    src={photo.public_url || `https://via.placeholder.com/100?text=${photo.id.substring(0, 8)}`}
                    alt={`Project photo ${photo.id}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(photo.captured_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {(photo.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {photo.is_pending_upload && (
                    <p className="text-xs text-amber-600 mt-1">Pending sync</p>
                  )}
                </div>
              </button>
            ))}
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
                  title="Baixar foto"
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
                className="w-full h-full object-contain rounded-lg"
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

      </div>
    </MainLayout>
  );
}

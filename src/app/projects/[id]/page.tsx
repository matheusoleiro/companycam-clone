'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/store/app';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/primitives/button';
import { Plus, Loader, X, Trash2, Edit2, MapPin } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProject, photos, isLoadingPhotos, loadPhotos, uploadPhoto, deletePhoto, selectProject, updateProject } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentProject?.name || '');

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      // Try to extract EXIF geolocation from photo metadata
      try {
        const arrayBuffer = await file.arrayBuffer();
        const piexif = (await import('piexifjs')).default;
        const exifDict = piexif.load(arrayBuffer);

        if (exifDict.GPS) {
          const gps = exifDict.GPS;
          // GPS format: [(degrees, 1), (minutes, 1), (seconds, 1)]
          const latitudeRef = exifDict.GPS[piexif.GPSIFD.GPSLatitudeRef]?.[0];
          const latArray = exifDict.GPS[piexif.GPSIFD.GPSLatitude];
          const longitudeRef = exifDict.GPS[piexif.GPSIFD.GPSLongitudeRef]?.[0];
          const lonArray = exifDict.GPS[piexif.GPSIFD.GPSLongitude];

          if (latArray && lonArray) {
            // Convert from degrees/minutes/seconds to decimal
            const dmsToDecimal = (dms: any[]) => {
              const degrees = dms[0][0] / dms[0][1];
              const minutes = dms[1][0] / dms[1][1];
              const seconds = dms[2][0] / dms[2][1];
              return degrees + minutes / 60 + seconds / 3600;
            };

            latitude = dmsToDecimal(latArray);
            longitude = dmsToDecimal(lonArray);

            // Apply reference direction
            if (latitudeRef === 'S') latitude *= -1;
            if (longitudeRef === 'W') longitude *= -1;

            console.log(`📸 Localização do EXIF: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        }
      } catch (exifErr) {
        console.warn('Erro ao ler EXIF:', exifErr);
      }

      // Fallback: get device geolocation if EXIF not available
      if (!latitude || !longitude) {
        if ('geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: true,
              });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            console.log(`📍 Localização do dispositivo: ${latitude}, ${longitude}`);
          } catch (geoErr) {
            console.warn('Geolocation não disponível:', geoErr);
          }
        }
      }

      await uploadPhoto(projectId, file, { latitude, longitude });
      // Reset input
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    } finally {
      setIsUploading(false);
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

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !currentProject) return;

    try {
      await updateProject(currentProject.id, editName);
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

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
                  setIsEditingName(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600"
                title="Editar nome"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            {currentProject.address && (
              <p className="text-sm text-slate-600 mb-1">{currentProject.address}</p>
            )}
            {currentProject.description && (
              <p className="text-slate-700 mb-3">{currentProject.description}</p>
            )}
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
          </div>

          <input
            id="photo-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 gap-2 flex items-center"
          >
            <Plus className="w-5 h-5" />
            {isUploading ? 'Uploading...' : 'Add Photo'}
          </button>
        </div>

        {/* Photos Grid or Timeline */}
        {isLoadingPhotos ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No photos yet</h3>
            <p className="text-slate-600 mb-6">Start documenting this project by adding your first photo.</p>
            <input
              id="photo-upload-empty"
              type="file"
              accept="image/*,video/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => document.getElementById('photo-upload-empty')?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Photo
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
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
            {photos.map((photo) => (
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
                  {photo.latitude && photo.longitude && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
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
                <p>{new Date(selectedPhoto.captured_at).toLocaleString()}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Name Modal */}
        {isEditingName && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Renomear Projeto</h2>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Novo nome
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Digite o novo nome"
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
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

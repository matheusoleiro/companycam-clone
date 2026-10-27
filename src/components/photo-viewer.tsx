'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/primitives/button';

interface Photo {
  id: string;
  public_url?: string;
}

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, isOpen, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!isOpen) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
        aria-label="Close photo viewer"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors disabled:opacity-50"
        disabled={photos.length === 1}
        aria-label="Previous photo"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      {/* Photo Container */}
      <div className="flex flex-col items-center gap-4 max-w-4xl w-full">
        {currentPhoto?.public_url && (
          <img
            src={currentPhoto.public_url}
            alt={`Photo ${currentIndex + 1}`}
            className="max-h-[70vh] w-auto object-contain rounded-lg"
          />
        )}

        {/* Counter */}
        <div className="text-white text-sm font-medium">
          {currentIndex + 1} de {photos.length}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors disabled:opacity-50"
        disabled={photos.length === 1}
        aria-label="Next photo"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
    </div>
  );
}

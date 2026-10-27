/**
 * Image compression and processing configuration
 */

export const IMAGE_QUALITY = {
  high: {
    label: 'high',
    maxDimension: 4096,
    jpegQuality: 1.0,
  },
  medium: {
    label: 'medium',
    maxDimension: 2048,
    jpegQuality: 0.75,
  },
  low: {
    label: 'low',
    maxDimension: 1024,
    jpegQuality: 0.5,
  },
} as const;

export type QualityLevel = keyof typeof IMAGE_QUALITY;

export const IMAGE_UPLOAD = {
  batchSize: 5,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  acceptedFormats: ['image/*', 'video/*'],
} as const;

export const IMAGE_DISPLAY = {
  placeholders: {
    grid: 'https://via.placeholder.com/300?text=Loading',
    timeline: 'https://via.placeholder.com/100?text=Loading',
  },
  maxPhotoViewerHeight: '70vh',
  gridColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
} as const;

/**
 * UI and layout constants
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const PHOTO_VIEWER = {
  maxHeight: '70vh',
  backgroundColor: 'bg-black',
  backgroundOpacity: 'bg-opacity-90',
  transitionDuration: 'duration-200',
} as const;

export const STORAGE_UNITS = {
  bytesToMB: 1024 * 1024,
  bytesToGB: 1024 * 1024 * 1024,
  decimalPlaces: 2,
} as const;

export const BUTTON_SIZES = {
  sm: {
    padding: 'px-2 sm:px-3 py-1 sm:py-2',
    fontSize: 'text-xs sm:text-sm',
    icon: 'w-3 h-3 sm:w-4 sm:h-4',
  },
  md: {
    padding: 'px-3 sm:px-4 py-2 sm:py-3',
    fontSize: 'text-sm sm:text-base',
    icon: 'w-4 h-4 sm:w-5 sm:h-5',
  },
  lg: {
    padding: 'px-4 sm:px-6 py-3 sm:py-4',
    fontSize: 'text-base sm:text-lg',
    icon: 'w-5 h-5 sm:w-6 sm:h-6',
  },
} as const;

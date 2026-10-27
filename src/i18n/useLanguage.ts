/**
 * Hook for managing language selection
 * Currently defaults to Portuguese
 * Can be extended with localStorage persistence
 */

import { useState } from 'react';
import { getStrings, Language } from './strings';

export function useLanguage(defaultLanguage: Language = 'pt') {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const strings = getStrings(language);

  return {
    language,
    setLanguage,
    strings,
  };
}

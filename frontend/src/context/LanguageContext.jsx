import React, { createContext, useContext, useState, useEffect } from 'react';
import { LAYOUT_TRANSLATIONS } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('preferred_language') || 'en');

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  return LAYOUT_TRANSLATIONS[language] || LAYOUT_TRANSLATIONS['en'];
};

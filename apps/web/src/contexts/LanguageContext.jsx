import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import translations from '@/lib/translations.js';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLangState] = useState(() => localStorage.getItem('language') || 'es');

  useEffect(() => {
    // Check if user is authenticated and has a saved preference
    if (pb.authStore.isValid && pb.authStore.model?.language) {
      const userLang = pb.authStore.model.language;
      if (userLang === 'en' || userLang === 'es') {
        setLangState(userLang);
        localStorage.setItem('language', userLang);
      }
    }
  }, []);

  const setLanguage = async (newLang) => {
    setLangState(newLang);
    localStorage.setItem('language', newLang);

    // Sync with backend if authenticated
    if (pb.authStore.isValid && pb.authStore.model?.id) {
      try {
        await pb.collection('users').update(pb.authStore.model.id, { 
          language: newLang 
        }, { $autoCancel: false });
        // Update local auth store model state to reflect the change silently
        pb.authStore.model.language = newLang;
      } catch (error) {
        console.error('Failed to save language preference to database:', error);
      }
    }
  };

  const t = (path, replacements = {}) => {
    const keys = path.split('.');
    let current = translations[language];
    
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in language: ${language}`);
        return path;
      }
      current = current[key];
    }
    
    let text = current;
    // Handle variable replacements like {{days}}
    for (const [key, value] of Object.entries(replacements)) {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="lang-transition-wrapper min-h-screen flex flex-col">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
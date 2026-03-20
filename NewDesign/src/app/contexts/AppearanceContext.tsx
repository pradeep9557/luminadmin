import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
  darkMode: boolean;
}

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => void;
}

const defaultSettings: AppearanceSettings = {
  primaryColor: '#0048ff',
  secondaryColor: '#090838',
  logo: '',
  favicon: '',
  darkMode: false,
};

const AppearanceContext = createContext<AppearanceContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const useAppearance = () => useContext(AppearanceContext);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('appearanceSettings', JSON.stringify(updated));
      return updated;
    });
  };

  // Apply CSS variables when settings change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    
    // Apply dark mode class
    if (settings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }

    // Update favicon if provided
    if (settings.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings]);

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

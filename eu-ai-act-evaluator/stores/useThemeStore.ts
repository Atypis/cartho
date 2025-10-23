import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'modern' | 'medieval';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'modern',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'modern' ? 'medieval' : 'modern',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

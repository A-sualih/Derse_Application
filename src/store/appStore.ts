import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage';

interface MediaProgress {
    position: number;
    duration: number;
    lastUpdated: number;
}

interface AppState {
    // Navigation State
    lastScreen: string | null;
    setLastScreen: (screen: string) => void;

    // Media Progress State
    progress: Record<string, MediaProgress>;
    saveProgress: (id: string, position: number, duration: number) => void;
    getProgress: (id: string) => MediaProgress | null;

    // UI/Settings State
    themePreference: 'light' | 'dark' | 'system';
    setThemePreference: (theme: 'light' | 'dark' | 'system') => void;

    // Background State
    isAppActive: boolean;
    setAppActive: (active: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            lastScreen: null,
            setLastScreen: (screen) => set({ lastScreen: screen }),

            progress: {},
            saveProgress: (id, position, duration) => {
                set((state) => ({
                    progress: {
                        ...state.progress,
                        [id]: {
                            position,
                            duration,
                            lastUpdated: Date.now(),
                        },
                    },
                }));
            },
            getProgress: (id) => get().progress[id] || null,

            themePreference: 'dark',
            setThemePreference: (theme) => set({ themePreference: theme }),

            isAppActive: true,
            setAppActive: (active) => set({ isAppActive: active }),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({
                lastScreen: state.lastScreen,
                progress: state.progress,
                themePreference: state.themePreference,
            }),
        }
    )
);

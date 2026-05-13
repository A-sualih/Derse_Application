import { MMKV } from 'react-native-mmkv';

// Professional Native Storage using MMKV
export const storage = new MMKV();

export const mmkvStorage = {
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value ?? null;
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
    clear: () => {
        storage.clearAll();
    },
};

// Typed storage helpers
export const setAppObject = (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
};

export const getAppObject = <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

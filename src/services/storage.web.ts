// Professional Web Fallback for Storage
// This file is used instead of storage.native.ts on Web platform
// It prevents "import.meta" and native module resolution errors

const mockMap = new Map<string, string>();

export const storage = {
    set: (key: string, value: string | boolean | number | Uint8Array) => {
        try {
            localStorage.setItem(key, String(value));
        } catch (e) {
            mockMap.set(key, String(value));
        }
    },
    getString: (key: string) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return mockMap.get(key);
        }
    },
    delete: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            mockMap.delete(key);
        }
    },
    clearAll: () => {
        try {
            localStorage.clear();
        } catch (e) {
            mockMap.clear();
        }
    },
} as any;

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

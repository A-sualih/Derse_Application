// Professional Web Fallback for Storage
// This file is used instead of storage.native.ts on Web platform
// It prevents "import.meta" and native module resolution errors

const mockMap = new Map<string, string>();

export const storage = {
    set: async (key: string, value: string | boolean | number | Uint8Array) => {
        try {
            localStorage.setItem(key, String(value));
        } catch (e) {
            mockMap.set(key, String(value));
        }
    },
    getString: async (key: string) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return mockMap.get(key) || null;
        }
    },
    delete: async (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            mockMap.delete(key);
        }
    },
    clearAll: async () => {
        try {
            localStorage.clear();
        } catch (e) {
            mockMap.clear();
        }
    },
} as any;

export const mmkvStorage = {
    setItem: async (key: string, value: string) => {
        await storage.set(key, value);
    },
    getItem: async (key: string) => {
        const value = await storage.getString(key);
        return value ?? null;
    },
    removeItem: async (key: string) => {
        await storage.delete(key);
    },
    clear: async () => {
        await storage.clearAll();
    },
};

export const setAppObject = async (key: string, value: any) => {
    await storage.set(key, JSON.stringify(value));
};

export const getAppObject = async <T>(key: string): Promise<T | null> => {
    const value = await storage.getString(key);
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const mmkvStorage = {
    setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
    },
    getItem: async (key: string) => {
        return await AsyncStorage.getItem(key);
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
    clear: async () => {
        await AsyncStorage.clear();
    },
};

// Typed storage helpers
export const setAppObject = async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getAppObject = async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

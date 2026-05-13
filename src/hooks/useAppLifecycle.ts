import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore } from '../store/appStore';

export const useAppLifecycle = () => {
    const setAppActive = useAppStore((state) => state.setAppActive);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            console.log(`[Lifecycle] AppState changed to: ${nextAppState}`);
            
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('[Lifecycle] App has come to the foreground!');
                setAppActive(true);
            } else if (nextAppState.match(/inactive|background/)) {
                console.log('[Lifecycle] App is going to the background');
                setAppActive(false);
                // State is already persisted by Zustand/MMKV on every change, 
                // but we can trigger additional "on background" logic here if needed.
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [setAppActive]);

    return { currentState: appState.current };
};

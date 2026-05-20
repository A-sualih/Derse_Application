import { setAudioModeAsync, useAudioPlayer, type AudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';
import { DriveFile } from '../types';
import { useMediaPlayerStore } from '../store/mediaPlayerStore';
import { useAppStore } from '../store/appStore';

interface AudioContextType {
    player: AudioPlayer | null;
    isPlaying: boolean;
    isLoading: boolean;
    currentUri: string | null;
    currentTitle: string | null;
    currentFileId: string | null;
    playbackRate: number;
    playSound: (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => Promise<void>;
    pauseSound: () => Promise<void>;
    seekScroll: (value: number) => Promise<void>;
    skip: (seconds: number) => Promise<void>;
    nextTrack: () => Promise<void>;
    previousTrack: () => Promise<void>;
    setPlaybackRate: (rate: number) => Promise<void>;
    currentQueue: DriveFile[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const AudioStateSyncer = ({ 
    player, 
    isPlaying, 
    duration, 
    setIsPlaying, 
    setDuration, 
    pendingSeekMs 
}: { 
    player: AudioPlayer, 
    isPlaying: boolean, 
    duration: number, 
    setIsPlaying: (playing: boolean) => void, 
    setDuration: (duration: number) => void, 
    pendingSeekMs: React.MutableRefObject<number | null> 
}) => {
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (typeof status.playing === 'boolean' && status.playing !== isPlaying) {
            setIsPlaying(status.playing);
        }
        
        const newDuration = (typeof status.duration === 'number' && !isNaN(status.duration) && status.duration > 0) ? Math.round(status.duration * 1000) : 0;
        if (newDuration > 0 && newDuration !== duration) {
            setDuration(newDuration);
        }

        // Handle initial restore seek
        if (pendingSeekMs.current !== null && typeof status.duration === 'number' && !isNaN(status.duration) && status.duration > 0) {
            const seekTargetSeconds = pendingSeekMs.current / 1000;
            player.seekTo(seekTargetSeconds);
            pendingSeekMs.current = null;
        }
    }, [status.playing, status.duration, isPlaying, duration, setIsPlaying, setDuration, player]);

    return null;
};

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const store = useMediaPlayerStore();
    
    // Create the global player instance
    const player = useAudioPlayer();
    
    const pendingSeekMs = useRef<number | null>(null);
    const progressSyncInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                });
                
                // Restore saved playback rate
                if (store.playbackRate !== 1.0) {
                    player.setPlaybackRate(store.playbackRate);
                }

                // Restore previous state if app was killed (without auto-playing)
                if (store.currentFile && store.playbackPosition > 0) {
                    console.log(`[AudioContext] Restoring previous track: ${store.currentFile.name} at ${store.playbackPosition}ms`);
                    pendingSeekMs.current = store.playbackPosition;
                    player.replace(store.currentFile.url);
                }
            } catch (error) {
                console.error('Error setting audio mode:', error);
            }
        };
        setupAudio();
    }, []);

    // Background interval to sync progress efficiently without re-rendering the whole tree!
    useEffect(() => {
        progressSyncInterval.current = setInterval(() => {
            if (player.playing && store.currentFile) {
                const currentMs = player.currentTime * 1000;
                const durationMs = player.duration * 1000;
                
                // Save to AppStore for resume later
                if (durationMs > 0 && currentMs > 0) {
                    useAppStore.getState().saveProgress(store.currentFile.id, currentMs, durationMs);
                }
            }
        }, 5000); // 5 seconds is perfect for background save, prevents MMKV thrashing!

        return () => {
            if (progressSyncInterval.current) clearInterval(progressSyncInterval.current);
        };
    }, [player, store.currentFile]);

    // Save strictly when app goes to background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if ((nextAppState === 'inactive' || nextAppState === 'background') && store.currentFile) {
                const currentMs = player.currentTime * 1000;
                const durationMs = player.duration * 1000;
                useAppStore.getState().saveProgress(store.currentFile.id, currentMs, durationMs);
                store.setPlaybackPosition(currentMs); // final state save
            }
        });
        return () => subscription.remove();
    }, [player, store.currentFile]);

    const saveCurrentProgressNow = useCallback(() => {
        if (store.currentFile) {
            const currentMs = player.currentTime * 1000;
            const durationMs = player.duration * 1000;
            useAppStore.getState().saveProgress(store.currentFile.id, currentMs, durationMs);
            store.setPlaybackPosition(currentMs);
        }
    }, [player, store.currentFile]);

    const playSound = async (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => {
        try {
            const isCurrentTrack = 
                (fileId && store.currentFile?.id === fileId) || 
                store.currentFile?.url === uri || 
                (store.currentFile && store.currentFile.name === title);

            if (isCurrentTrack) {
                if (player.playing) {
                    player.pause();
                    store.setIsPlaying(false);
                } else {
                    player.play();
                    store.setIsPlaying(true);
                }
                return;
            }

            store.setIsLoading(true);
            saveCurrentProgressNow(); // Save old track progress
            
            const searchList = queue || store.queue || DRIVE_FILES;
            const foundFile = searchList.find(f => f.url === uri || (fileId && f.id === fileId)) || {
                id: fileId || `dynamic-${Date.now()}`,
                name: title || 'Audio',
                type: 'audio' as const,
                url: uri
            };

            const savedProgress = useAppStore.getState().getProgress(foundFile.id);
            const targetPositionMs = savedProgress ? savedProgress.position : 0;
            
            store.setCurrentFile({...foundFile, url: uri});
            if (queue) store.setQueue(queue);
            
            store.setPlaybackPosition(targetPositionMs);

            if (targetPositionMs > 0) {
                pendingSeekMs.current = targetPositionMs;
            }

            player.replace(uri);
            player.play();
            store.setIsPlaying(true);
            store.setIsLoading(false);
        } catch (error: any) {
            console.error('Error playing sound', error);
            store.setIsLoading(false);
            Alert.alert('Playback Error', `Error playing audio: ${error.message || error}`);
        }
    };

    const pauseSound = async () => {
        player.pause();
        store.setIsPlaying(false);
        saveCurrentProgressNow();
    };

    const seekScroll = async (value: number) => {
        try {
            player.seekTo(value / 1000);
            store.setPlaybackPosition(value);
            if (store.currentFile) {
                useAppStore.getState().saveProgress(store.currentFile.id, value, player.duration * 1000);
            }
        } catch (error) {
            console.error('Seek error:', error);
        }
    };

    const skip = async (seconds: number) => {
        try {
            const currentPositionMs = player.currentTime * 1000;
            const changeMs = seconds * 1000;
            const durationMs = player.duration * 1000;
            const targetMs = Math.max(0, durationMs > 0 ? Math.min(durationMs, currentPositionMs + changeMs) : currentPositionMs + changeMs);
            
            player.seekTo(targetMs / 1000);
            store.setPlaybackPosition(targetMs);
        } catch (error) {
            console.error('Skip error:', error);
        }
    };

    const nextTrack = async () => {
        const audioFiles = store.queue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        const currentIndex = audioFiles.findIndex(f => f.id === store.currentFile?.id);
        const nextIndex = (currentIndex + 1) % audioFiles.length;
        const nextFile = audioFiles[nextIndex];
        
        saveCurrentProgressNow();
        pendingSeekMs.current = null;
        playSound(nextFile.url, nextFile.name, store.queue, nextFile.id);
    };

    const previousTrack = async () => {
        if (player.currentTime > 3) {
            player.seekTo(0);
            return;
        }

        const audioFiles = store.queue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        const currentIndex = audioFiles.findIndex(f => f.id === store.currentFile?.id);
        const prevIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length;
        const prevFile = audioFiles[prevIndex];
        
        saveCurrentProgressNow();
        pendingSeekMs.current = null;
        playSound(prevFile.url, prevFile.name, store.queue, prevFile.id);
    };

    const setPlaybackRate = async (rate: number) => {
        store.setPlaybackRate(rate);
        player.setPlaybackRate(rate);
    };

    return (
        <AudioContext.Provider value={{
            player,
            isPlaying: store.isPlaying,
            isLoading: store.isLoading,
            currentUri: store.currentFile?.url || null,
            currentTitle: store.currentFile?.name || null,
            currentFileId: store.currentFile?.id || null,
            playbackRate: store.playbackRate,
            playSound,
            pauseSound,
            seekScroll,
            skip,
            nextTrack,
            previousTrack,
            setPlaybackRate,
            currentQueue: store.queue
        }}>
            <AudioStateSyncer 
                player={player} 
                isPlaying={store.isPlaying} 
                duration={store.duration} 
                setIsPlaying={store.setIsPlaying} 
                setDuration={store.setDuration} 
                pendingSeekMs={pendingSeekMs} 
            />
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

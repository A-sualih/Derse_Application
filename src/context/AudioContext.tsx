import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';
import { DriveFile } from '../types';
import { useMediaPlayerStore } from '../store/mediaPlayerStore';

interface AudioContextType {
    isPlaying: boolean;
    isLoading: boolean;
    currentUri: string | null;
    currentTitle: string | null;
    currentFileId: string | null;
    position: number;
    duration: number;
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

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const store = useMediaPlayerStore();
    const player = useAudioPlayer();
    const status = useAudioPlayerStatus(player);
    const lastSyncPosition = useRef(0);

    // Sync status with store
    useEffect(() => {
        store.setIsPlaying(status.playing);
        store.setDuration(status.duration * 1000);
        
        // Only update store position if it has changed significantly (to avoid too many writes)
        const currentMs = status.currentTime * 1000;
        if (Math.abs(currentMs - lastSyncPosition.current) > 1000) {
            store.setPlaybackPosition(currentMs);
            lastSyncPosition.current = currentMs;
        }
    }, [status.playing, status.duration, status.currentTime]);

    useEffect(() => {
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    interruptionModeAndroid: 'duckOthers' as any,
                });
                
                // Restore saved playback rate
                if (store.playbackRate !== 1.0) {
                    player.setPlaybackRate(store.playbackRate);
                }

                // Restore previous state if app was killed
                if (store.currentFile && store.playbackPosition > 0) {
                    console.log(`[AudioContext] Restoring previous track: ${store.currentFile.name} at ${store.playbackPosition}ms`);
                    await player.replace(store.currentFile.url);
                    await player.seekTo(store.playbackPosition / 1000);
                }
            } catch (error) {
                console.error('Error setting audio mode:', error);
            }
        };
        setupAudio();
    }, []);

    const playSound = async (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => {
        try {
            if (store.currentFile?.url === uri) {
                if (status.playing) {
                    player.pause();
                } else {
                    player.play();
                }
                return;
            }

            store.setIsLoading(true);
            
            const searchList = queue || store.queue || DRIVE_FILES;
            const foundFile = searchList.find(f => f.url === uri || (fileId && f.id === fileId)) || {
                id: fileId || 'dynamic',
                name: title || 'Audio',
                type: 'audio' as const,
                url: uri
            };

            store.setCurrentFile(foundFile);
            if (queue) store.setQueue(queue);

            // Seek to saved position if exists
            await player.replace(uri);
            if (store.playbackPosition > 0) {
                await player.seekTo(store.playbackPosition / 1000);
            }
            
            player.play();
            store.setIsLoading(false);

        } catch (error: any) {
            console.error('Error playing sound', error);
            store.setIsLoading(false);
            Alert.alert('Playback Error', `Error playing audio: ${error.message || error}`);
        }
    };

    const pauseSound = async () => {
        player.pause();
    };

    const seekScroll = async (value: number) => {
        try {
            await player.seekTo(value / 1000);
            store.setPlaybackPosition(value);
        } catch (error) {
            console.error('Seek error:', error);
        }
    };

    const skip = async (seconds: number) => {
        try {
            const newPosition = (status.currentTime + seconds);
            await player.seekTo(Math.max(0, newPosition));
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
        
        store.setPlaybackPosition(0);
        playSound(nextFile.url, nextFile.name, store.queue, nextFile.id);
    };

    const previousTrack = async () => {
        if (status.currentTime > 3) {
            player.seekTo(0);
            return;
        }

        const audioFiles = store.queue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        const currentIndex = audioFiles.findIndex(f => f.id === store.currentFile?.id);
        const prevIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length;
        const prevFile = audioFiles[prevIndex];
        
        store.setPlaybackPosition(0);
        playSound(prevFile.url, prevFile.name, store.queue, prevFile.id);
    };

    const setPlaybackRate = async (rate: number) => {
        try {
            store.setPlaybackRate(rate);
            player.setPlaybackRate(rate);
        } catch (error) {
            console.error('Error setting playback rate:', error);
        }
    };

    return (
        <AudioContext.Provider value={{
            isPlaying: store.isPlaying,
            isLoading: store.isLoading,
            currentUri: store.currentFile?.url || null,
            currentTitle: store.currentFile?.name || null,
            currentFileId: store.currentFile?.id || null,
            position: status.currentTime * 1000,
            duration: status.duration * 1000,
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
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};

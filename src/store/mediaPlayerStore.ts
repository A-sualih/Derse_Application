import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage';
import { DriveFile } from '../types';

interface MediaPlayerState {
    currentFile: DriveFile | null;
    queue: DriveFile[];
    isPlaying: boolean;
    playbackPosition: number; // in ms
    duration: number; // in ms
    playbackRate: number;
    isLoading: boolean;

    // Actions
    setCurrentFile: (file: DriveFile | null) => void;
    setQueue: (queue: DriveFile[]) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setPlaybackPosition: (position: number) => void;
    setDuration: (duration: number) => void;
    setPlaybackRate: (rate: number) => void;
    setIsLoading: (isLoading: boolean) => void;
    
    // Complex Actions
    reset: () => void;
}

export const useMediaPlayerStore = create<MediaPlayerState>()(
    persist(
        (set) => ({
            currentFile: null,
            queue: [],
            isPlaying: false,
            playbackPosition: 0,
            duration: 0,
            playbackRate: 1.0,
            isLoading: false,

            setCurrentFile: (file) => set({ currentFile: file }),
            setQueue: (queue) => set({ queue }),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            setPlaybackPosition: (playbackPosition) => set({ playbackPosition }),
            setDuration: (duration) => set({ duration }),
            setPlaybackRate: (playbackRate) => set({ playbackRate }),
            setIsLoading: (isLoading) => set({ isLoading }),

            reset: () => set({ 
                currentFile: null, 
                isPlaying: false, 
                playbackPosition: 0, 
                duration: 0 
            }),
        }),
        {
            name: 'media-player-storage',
            storage: createJSONStorage(() => mmkvStorage),
            partialize: (state) => ({
                currentFile: state.currentFile,
                playbackPosition: state.playbackPosition,
                playbackRate: state.playbackRate,
                queue: state.queue,
            }),
        }
    )
);

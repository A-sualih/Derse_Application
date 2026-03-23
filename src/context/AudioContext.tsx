import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';
import { DriveFile } from '../types';

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
    pauseSound: (savePosition?: boolean) => Promise<void>;
    seekScroll: (value: number) => Promise<void>;
    skip: (seconds: number) => Promise<void>;
    nextTrack: () => Promise<void>;
    previousTrack: () => Promise<void>;
    setPlaybackRate: (rate: number) => Promise<void>;
    currentQueue: DriveFile[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [localIsPlaying, setLocalIsPlaying] = useState(false);
    const player = useAudioPlayer();
    const status = useAudioPlayerStatus(player);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackRate, setPlaybackRateState] = useState(1.0);
    const positionSaveInterval = useRef<any>(null);
    const pendingSeekPosition = useRef<number | null>(null);
    const shouldAutoPlay = useRef(false);

    // Sync status back to our context-friendly state
    const positionRef = useRef(0);
    const isPlaying = localIsPlaying;
    const position = status.currentTime * 1000; // status is in seconds, we use ms for compatibility
    const duration = status.duration * 1000;

    // Keep positionRef in sync with position for background saving
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Sync localIsPlaying with native status
    useEffect(() => {
        setLocalIsPlaying(status.playing);
    }, [status.playing]);

    // Remove problematic status.error monitor as it triggers on released objects
    // Error handling will be done per method call


    useEffect(() => {
        // Configure audio mode for background playback and load saved playback rate
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    interruptionModeAndroid: 'duckOthers' as any,
                });
                console.log('Audio mode configured for background playback');

                // Load saved playback rate
                const savedRate = await AsyncStorage.getItem('playback_rate');
                if (savedRate) {
                    const rate = parseFloat(savedRate);
                    setPlaybackRateState(rate);
                }
            } catch (error) {
                console.error('Error setting audio mode:', error);
            }
        };
        setupAudio();
    }, []);

    // Clear auto-play when currentUri is changed but replace hasn't happened
    useEffect(() => {
        if (!currentUri) {
            shouldAutoPlay.current = false;
        }
    }, [currentUri]);

    // Auto-play and restore position logic
    // We watch status.duration which indicates a successful track load
    useEffect(() => {
        let isDead = false;
        if (!currentUri || !shouldAutoPlay.current || status.duration === 0) return;

        const performSeekAndPlay = async () => {
            const posToRestore = pendingSeekPosition.current;
            pendingSeekPosition.current = null;
            shouldAutoPlay.current = false;

            try {
                if (posToRestore && posToRestore > 0) {
                    console.log(`[AudioContext] Resuming ${currentUri} at ${posToRestore / 1000}s`);
                    await player.seekTo(posToRestore / 1000);
                }
                if (!isDead) {
                    player.play();
                    setIsLoading(false);
                }
            } catch (error) {
                console.log('[AudioContext] Auto-play seek/play error:', error);
                if (!isDead) {
                    player.play();
                    setIsLoading(false);
                }
            }
        };

        performSeekAndPlay();

        return () => {
            isDead = true;
        };
    }, [status.duration, currentUri]); // Only trigger when duration is determined or URI changes


    // Fallback timer to stop loading if it hangs (e.g. broken file or network issue)
    useEffect(() => {
        let timeout: any;
        if (isLoading) {
            timeout = setTimeout(() => {
                if (isLoading) {
                    console.log('Playback seems to have hung or is taking too long, forcing loading state to false');
                    setIsLoading(false);
                    if (status.duration === 0) {
                        console.warn('Audio duration is still 0. This might be a restriction or an invalid file.');
                    }
                }
            }, 10000); // 10 seconds timeout
        }
        return () => clearTimeout(timeout);
    }, [isLoading, status.duration]);

    const getPersistenceKey = (id: string | null, title: string | null) => {
        const identifier = id || (title ? encodeURIComponent(title) : 'unknown');
        return `audio_pos_${identifier}`;
    };

    // Handle completion
    useEffect(() => {
        if (status.didJustFinish) {
            player.seekTo(0).catch(err => console.error('Seek to start error:', err));
            const key = getPersistenceKey(currentFileId, currentTitle);
            AsyncStorage.removeItem(key).catch(() => {});
        }
    }, [status.didJustFinish, currentFileId, currentTitle, player]);

    // Save position periodically when playing
    useEffect(() => {
        const key = getPersistenceKey(currentFileId, currentTitle);
        if (isPlaying && currentUri) {
            positionSaveInterval.current = setInterval(() => {
                const currentPos = positionRef.current;
                if (currentPos > 0) {
                    AsyncStorage.setItem(key, currentPos.toString())
                        .catch(e => { /* Ignore background saving errors */ });
                }
            }, 5000); // Save more frequently (5s)
        } else {
            if (positionSaveInterval.current) {
                clearInterval(positionSaveInterval.current);
                positionSaveInterval.current = null;
            }
            // Save one last time on pause
            const currentPos = positionRef.current;
            if (currentUri && currentPos > 0) {
                AsyncStorage.setItem(key, currentPos.toString())
                    .catch(() => { });
            }
        }
        return () => {
            if (positionSaveInterval.current) {
                clearInterval(positionSaveInterval.current);
                positionSaveInterval.current = null;
            }
        };
    }, [isPlaying, currentUri, currentFileId, currentTitle]);

    const [currentQueue, setCurrentQueue] = useState<DriveFile[]>(DRIVE_FILES);

    // ... (rest of the effects)

    const playSound = async (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => {
        try {
            if (currentUri === uri) {
                try {
                    if (status.playing) {
                        setLocalIsPlaying(false);
                        player.pause();
                    } else {
                        setLocalIsPlaying(true);
                        player.play();
                    }
                } catch (e) {
                    console.log('[AudioContext] Toggle play failed', e);
                }
                return;
            }

            // INSTANT STATE UPDATES
            setLocalIsPlaying(true);
            setIsLoading(true);

            // Determine Title and ID INSTANTLY
            let foundTitle = title;
            let foundId = fileId;
            const searchList = queue || currentQueue || DRIVE_FILES;

            if (!foundTitle || !foundId) {
                const foundFile = searchList.find(f => f.url === uri || (fileId && f.id === fileId));
                if (foundFile) {
                    if (!foundTitle) foundTitle = foundFile.name;
                    if (!foundId) foundId = foundFile.id;
                }
            }

            setCurrentTitle(foundTitle || 'Audio');
            setCurrentFileId(foundId || null);

            if (queue) {
                setCurrentQueue(queue);
            }

            // Finally set the URI to trigger loading
            shouldAutoPlay.current = true;
            setIsLoading(true);

            // ENCODE URI: Crucial for files with spaces/special characters
            let playUri = uri;
            if (playUri.startsWith('file://')) {
                const parts = playUri.split('file://');
                playUri = 'file://' + encodeURI(parts[1]);
            }

            console.log(`[AudioContext] playSound switching to: ${playUri}`);

            const key = getPersistenceKey(foundId || null, foundTitle || null);
            const savedPos = await AsyncStorage.getItem(key).catch(() => null);
            
            if (savedPos) {
                pendingSeekPosition.current = parseInt(savedPos, 10);
                console.log(`[AudioContext] Found saved position for ${foundTitle}: ${pendingSeekPosition.current}ms`);
            } else {
                pendingSeekPosition.current = null;
            }

            shouldAutoPlay.current = true;
            setCurrentUri(playUri); // Keep this to update UI/other effects that depend on currentUri
            
            try {
                await player.replace(playUri);
            } catch (e) {
                console.error('[AudioContext] Player replace error', e);
                // Fallback: if replace fails, setting internal state might help some hooks
                setIsLoading(false);
            }

        } catch (error: any) {
            console.error('Error playing sound', error);
            setIsLoading(false);
            if (Platform.OS === 'web' && (uri.includes('drive.google.com') || uri.includes('docs.google.com'))) {
                const message = 'Google Drive audio links cannot stream directly in the browser due to CORS. Open in new tab?';
                if (window.confirm(message)) {
                    Linking.openURL(uri);
                }
            } else {
                Alert.alert('Playback Error', `Error playing audio: ${error.message || error}`);
            }
        }
    };

    const pauseSound = async () => {
        setLocalIsPlaying(false);
        if (player.playing) {
            player.pause();
            if (currentUri) {
                const key = getPersistenceKey(currentFileId, currentTitle);
                AsyncStorage.setItem(key, position.toString()).catch(() => {});
            }
        }
    };

    const seekScroll = async (value: number) => {
        try {
            await player.seekTo(value / 1000);
            if (currentUri) {
                const key = getPersistenceKey(currentFileId, currentTitle);
                AsyncStorage.setItem(key, value.toString()).catch(() => {});
            }
        } catch (error) {
            console.error('Seek error:', error);
        }
    };
    const skip = async (seconds: number) => {
        try {
            const newPosition = position + seconds * 1000;
            // If duration is 0 (unknown), assume we can seek forward without limit
            const clampedPosition = duration > 0 ? Math.max(0, Math.min(newPosition, duration)) : Math.max(0, newPosition);
            await player.seekTo(clampedPosition / 1000);
            if (currentUri) {
                const key = getPersistenceKey(currentFileId, currentTitle);
                AsyncStorage.setItem(key, clampedPosition.toString()).catch(() => {});
            }
        } catch (error) {
            console.error('Skip error:', error);
        }
    };

    const nextTrack = async () => {
        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        let currentIndex = -1;

        if (currentFileId) {
            currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        }

        if (currentIndex === -1) {
            currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        }

        let nextIndex = 0;
        if (currentIndex !== -1 && currentIndex < audioFiles.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (currentIndex === audioFiles.length - 1) {
            nextIndex = 0; // Loop back to start
        }

        const nextFile = audioFiles[nextIndex];
        let playUri = nextFile.url;
        
        try {
            const { checkFileExists, getLocalUri } = require('../utils/fileSystem');
            const exists = await checkFileExists(nextFile.name);
            if (exists) {
                const local = getLocalUri(nextFile.name);
                if (local) playUri = local;
            }
        } catch (e) {
            console.error('Error checking local file for nextTrack', e);
        }

        playSound(playUri, nextFile.name, currentQueue, nextFile.id);
    };

    const previousTrack = async () => {
        // If we've played more than 3 seconds, restart the current track instead of going back
        if (position > 3000) {
            player.seekTo(0);
            return;
        }

        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        let currentIndex = -1;

        if (currentFileId) {
            currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        }

        if (currentIndex === -1) {
            currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        }

        let prevIndex = audioFiles.length - 1;
        if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
        } else if (currentIndex === 0) {
            prevIndex = audioFiles.length - 1; // Loop to end
        }

        const prevFile = audioFiles[prevIndex];
        
        let playUri = prevFile.url;
        
        try {
            const { checkFileExists, getLocalUri } = require('../utils/fileSystem');
            const exists = await checkFileExists(prevFile.name);
            if (exists) {
                const local = getLocalUri(prevFile.name);
                if (local) playUri = local;
            }
        } catch (e) {
            console.error('Error checking local file for previousTrack', e);
        }

        playSound(playUri, prevFile.name, currentQueue, prevFile.id);
    };

    const setPlaybackRate = async (rate: number) => {
        try {
            setPlaybackRateState(rate);
            player.setPlaybackRate(rate);
            await AsyncStorage.setItem('playback_rate', rate.toString());
            console.log('Playback rate set to:', rate);
        } catch (error) {
            console.error('Error setting playback rate:', error);
        }
    };

    // Apply playback rate when player is ready
    useEffect(() => {
        if (currentUri && status.duration > 0 && playbackRate !== 1.0) {
            player.setPlaybackRate(playbackRate);
        }
    }, [currentUri, status.duration, playbackRate, player]);

    return (
        <AudioContext.Provider value={{
            isPlaying, isLoading, currentUri, currentTitle, currentFileId, position, duration,
            playbackRate, playSound, pauseSound, seekScroll, skip, nextTrack, previousTrack, setPlaybackRate,
            currentQueue
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

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useMediaPlayerStore } from '../store/mediaPlayerStore';

const { width } = Dimensions.get('window');

interface ProfessionalPlayerProps {
    source: string;
    title: string;
    onClose?: () => void;
}

export const ProfessionalPlayer = React.memo(({ source, title, onClose }: ProfessionalPlayerProps) => {
    const store = useMediaPlayerStore();
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const controlsTimer = useRef<NodeJS.Timeout | null>(null);

    // Initialize Video Player
    const player = useVideoPlayer(source, (player) => {
        player.loop = false;
        
        // Restore progress
        if (store.playbackPosition > 0) {
            console.log(`[Video] Restoring position: ${store.playbackPosition / 1000}s`);
            player.seekBy(store.playbackPosition / 1000);
        }
        
        player.play();
    });

    // Auto-save progress
    useEffect(() => {
        const interval = setInterval(() => {
            if (player.playing) {
                const currentPos = player.currentTime * 1000;
                store.setPlaybackPosition(currentPos);
            }
        }, 3000); // Every 3 seconds

        return () => clearInterval(interval);
    }, [player]);

    // Handle background behavior
    useEffect(() => {
        if (!store.isAppActive && player.playing) {
            // App is backgrounded, keep playing if desired or pause
        }
    }, [store.isAppActive]);

    const toggleControls = useCallback(() => {
        setIsControlsVisible(prev => !prev);
        if (!isControlsVisible) {
            startControlsTimer();
        }
    }, [isControlsVisible]);

    const startControlsTimer = useCallback(() => {
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000);
    }, []);

    useEffect(() => {
        startControlsTimer();
        return () => {
            if (controlsTimer.current) clearTimeout(controlsTimer.current);
        };
    }, [startControlsTimer]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={toggleControls} 
                style={styles.playerWrapper}
            >
                <VideoView 
                    player={player} 
                    style={styles.video} 
                    contentMode="contain"
                    allowsFullscreen
                    allowsPictureInPicture
                />

                {isControlsVisible && (
                    <Animated.View 
                        entering={FadeIn} 
                        exiting={FadeOut} 
                        style={styles.controlsOverlay}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                                <Ionicons name="chevron-down" size={28} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Center Controls */}
                        <View style={styles.centerControls}>
                            <TouchableOpacity onPress={() => player.seekBy(-10)}>
                                <Ionicons name="refresh-outline" size={40} color="#FFF" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.playButton}
                                onPress={() => player.playing ? player.pause() : player.play()}
                            >
                                <Ionicons 
                                    name={player.playing ? "pause" : "play"} 
                                    size={50} 
                                    color="#FFF" 
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => player.seekBy(10)}>
                                <Ionicons name="refresh-outline" size={40} color="#FFF" style={{ transform: [{ scaleX: -1 }] }} />
                            </TouchableOpacity>
                        </View>

                        {/* Footer / Progress */}
                        <View style={styles.footer}>
                            <View style={styles.timeRow}>
                                <Text style={styles.timeText}>{formatTime(player.currentTime * 1000)}</Text>
                                <Text style={styles.timeText}>{formatTime(player.duration * 1000)}</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={player.duration}
                                value={player.currentTime}
                                onSlidingComplete={(value) => player.seekTo(value)}
                                minimumTrackTintColor="#4ade80"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#4ade80"
                            />
                        </View>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    playerWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    iconButton: {
        padding: 5,
    },
    centerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.5)',
    },
    footer: {
        marginBottom: 20,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    timeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
    },
    slider: {
        width: '100%',
        height: 40,
    },
});

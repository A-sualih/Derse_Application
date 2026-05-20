import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MiniPlayer: React.FC = () => {
    const { player, currentUri } = useAudio();

    if (!currentUri || !player) return null;

    return <MiniPlayerContent player={player} />;
};

const MiniPlayerContent: React.FC<{ player: AudioPlayer }> = ({ player }) => {
    const {
        isPlaying,
        currentUri,
        currentTitle,
        currentFileId,
        isLoading,
        playbackRate,
        playSound,
        pauseSound,
        seekScroll,
        skip,
        nextTrack,
        previousTrack,
        setPlaybackRate,
        currentQueue
    } = useAudio();
    
    const status = useAudioPlayerStatus(player);
    const position = (typeof status.currentTime === 'number' && !isNaN(status.currentTime)) ? status.currentTime * 1000 : 0;
    const duration = (typeof status.duration === 'number' && !isNaN(status.duration)) ? status.duration * 1000 : 0;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [showTrackList, setShowTrackList] = useState(false);

    // Define audioFiles for the list modal from the current queue
    const audioFiles = currentQueue.filter(file => file.type === 'audio');

    // Use title from context, or fallback to "Audio"
    const trackName = currentTitle || 'Audio';

    // Available playback speeds
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    const handleSpeedCycle = () => {
        const currentIndex = speeds.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackRate(speeds[nextIndex]);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseSound();
        } else if (currentUri) {
            playSound(currentUri);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.max(0, Math.floor((millis || 0) / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const TEXT_COLOR = '#FFFFFF';
    const SECONDARY_TEXT_COLOR = '#86efac'; // Sleek light green text
    const ACCENT_COLOR = '#22c55e'; // Vibrant Emerald Green
    const GLOW_COLOR = '#4ade80';

    return (
        <View style={styles.outerContainer}>
            <BlurView
                intensity={95}
                tint="dark"
                style={styles.container}
            >
                {/* Premium Deep Midnight & Emerald Gradient Background */}
                <LinearGradient
                    colors={['rgba(2, 6, 23, 0.95)', 'rgba(6, 78, 59, 0.75)', 'rgba(2, 6, 23, 0.95)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Elegant Ambient Glowing Mesh Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(34, 197, 94, 0.1)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { transform: [{ skewX: '-15deg' }] }]}
                />

                {/* Main Content Info & Core Controls */}
                <View style={styles.header}>
                    <View style={styles.titleInfo}>
                        <View style={styles.iconBox}>
                            <LinearGradient
                                colors={['#22c55e', '#15803d']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <Ionicons
                                name="musical-notes"
                                size={18}
                                color="#FFFFFF"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title} numberOfLines={1}>
                                {trackName}
                            </Text>
                            <Text style={styles.subtitle}>
                                {isPlaying ? 'Playing Audio Lesson' : 'Paused'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={handleSpeedCycle}
                            style={styles.speedBtn}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.speedText}>
                                {playbackRate}x
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowTrackList(true)}
                            style={styles.iconBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="list" size={20} color={TEXT_COLOR} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePlayPause}
                            style={styles.playBtn}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[GLOW_COLOR, '#15803d']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={24}
                                    color="#FFFFFF"
                                    style={!isPlaying ? { marginLeft: 2 } : {}}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Timeline / Progress Section */}
                <View style={styles.sliderSection}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration > 0 ? duration : 100}
                        disabled={duration === 0}
                        value={position}
                        onSlidingComplete={seekScroll}
                        minimumTrackTintColor={GLOW_COLOR}
                        maximumTrackTintColor={'rgba(255, 255, 255, 0.15)'}
                        thumbTintColor={GLOW_COLOR}
                    />
                    <View style={styles.timeLabelContainer}>
                        <Text style={styles.timeLabel}>
                            {formatTime(position)}
                        </Text>
                        <Text style={styles.timeLabel}>
                            {duration > 0 ? formatTime(duration) : '--:--'}
                        </Text>
                    </View>
                </View>

                {/* Playback Control Buttons (Skip, Skip 10s) */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        onPress={previousTrack}
                        style={styles.skipBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-skip-back" size={22} color={GLOW_COLOR} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => skip(-10)}
                        style={styles.seekBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-back" size={16} color={SECONDARY_TEXT_COLOR} />
                        <Text style={[styles.seekText, { marginTop: -2 }]}>-10s</Text>
                    </TouchableOpacity>

                    <View style={styles.centerFiller} />

                    <TouchableOpacity
                        onPress={() => skip(10)}
                        style={styles.seekBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-forward" size={16} color={SECONDARY_TEXT_COLOR} />
                        <Text style={[styles.seekText, { marginTop: -2 }]}>+10s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={nextTrack}
                        style={styles.skipBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-skip-forward" size={22} color={GLOW_COLOR} />
                    </TouchableOpacity>
                </View>
            </BlurView>

            <Modal
                visible={showTrackList}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTrackList(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: '#0f172a' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: '#f8fafc' }]}>Course Queue</Text>
                            <TouchableOpacity
                                onPress={() => setShowTrackList(false)}
                                style={styles.closeIcon}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={22} color="#f8fafc" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={audioFiles}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.trackItem,
                                        {
                                            backgroundColor: item.id === currentFileId ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                                            borderColor: item.id === currentFileId ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.05)'
                                        }
                                    ]}
                                    onPress={async () => {
                                        let playUri = item.url;
                                        try {
                                            const { checkFileExists, getLocalUri } = require('../utils/fileSystem');
                                            const exists = await checkFileExists(item.name);
                                            if (exists) {
                                                const local = getLocalUri(item.name);
                                                if (local) playUri = local;
                                            }
                                        } catch (e) {
                                            console.error('Error checking local file for queue play', e);
                                        }
                                        playSound(playUri, item.name, undefined, item.id);
                                        setShowTrackList(false);
                                    }}
                                >
                                    <View style={[styles.trackStatusIcon, { backgroundColor: item.id === currentFileId ? '#22c55e' : 'rgba(255,255,255,0.08)' }]}>
                                        <Ionicons
                                            name={item.id === currentFileId ? "volume-high" : "musical-note"}
                                            size={16}
                                            color={item.id === currentFileId ? '#FFFFFF' : '#94a3b8'}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.trackName,
                                        {
                                            color: item.id === currentFileId ? '#4ade80' : '#f8fafc',
                                            fontWeight: item.id === currentFileId ? '700' : '500'
                                        }
                                    ]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 74, // Suspends floating player beautifully above navigation bar
        left: 14,
        right: 14,
        elevation: 20,
        shadowColor: '#10b981', // Glowing emerald shadow
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
    },
    container: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 18,
        borderRadius: 24, // Sleek floating capsule
        borderWidth: 1.5,
        borderColor: 'rgba(74, 222, 128, 0.15)', // Highly attractive glowing borders
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    titleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circular album art style
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.4,
    },
    subtitle: {
        fontSize: 11,
        color: '#86efac',
        marginTop: 2,
        fontWeight: '500',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    playBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    sliderSection: {
        marginBottom: 10,
    },
    slider: {
        height: 24,
        marginHorizontal: -8, // Align slider better
    },
    timeLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -4,
        paddingHorizontal: 2,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#86efac',
        letterSpacing: 0.5,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    centerFiller: {
        flex: 1,
    },
    skipBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    seekBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    seekText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#86efac',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        borderTopWidth: 1.5,
        borderColor: 'rgba(74, 222, 128, 0.15)',
        elevation: 25,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.8,
    },
    closeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    trackStatusIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    trackName: {
        fontSize: 14,
        flex: 1,
        letterSpacing: -0.2,
    },
    speedBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    speedText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#4ade80',
    },
});

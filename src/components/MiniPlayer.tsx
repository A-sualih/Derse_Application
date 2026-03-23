import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MiniPlayer: React.FC = () => {
    const {
        isPlaying,
        currentUri,
        currentTitle,
        isLoading,
        position,
        duration,
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
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [showTrackList, setShowTrackList] = useState(false);

    if (!currentUri) return null;

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

    const isDark = colorScheme === 'dark';
    const isWeb = Platform.OS === 'web';

    const formatTime = (millis: number) => {
        const totalSeconds = Math.max(0, Math.floor((millis || 0) / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const TEXT_COLOR = '#FFFFFF';
    const SECONDARY_TEXT_COLOR = '#bbf7d0'; // Light green text for secondary
    const ICON_COLOR = '#FFFFFF';
    const ACCENT_COLOR = '#4ade80'; // Bright green

    return (
        <View style={styles.outerContainer}>
            <BlurView
                intensity={90}
                tint="dark"
                style={[styles.container]}
            >
                {/* Premium Black-Green Gradient Background */}
                <LinearGradient
                    colors={['#020617', '#14532d', '#020617']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Decorative Pattern / Shine */}
                <LinearGradient
                    colors={['transparent', 'rgba(74, 222, 128, 0.05)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { transform: [{ skewX: '-20deg' }] }]}
                />

                <View style={styles.header}>
                    <View style={styles.titleInfo}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <Ionicons
                                name="musical-note"
                                size={20}
                                color={ACCENT_COLOR}
                            />
                        </View>
                        <Text style={[styles.title, { color: TEXT_COLOR }]} numberOfLines={1}>
                            {trackName}
                        </Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={handleSpeedCycle}
                            style={[styles.speedBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                        >
                            <Text style={[styles.speedText, { color: ACCENT_COLOR }]}>
                                {playbackRate}x
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowTrackList(true)}
                            style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                        >
                            <Ionicons name="list" size={24} color={TEXT_COLOR} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePlayPause}
                            style={[styles.playBtn, { backgroundColor: ACCENT_COLOR, shadowColor: ACCENT_COLOR }]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={28}
                                    color="#020617"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        onPress={previousTrack}
                        style={[styles.skipBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="play-skip-back" size={28} color={ACCENT_COLOR} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => skip(-10)}
                        style={[styles.skipBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                    >
                        <Ionicons name="refresh" size={20} color={SECONDARY_TEXT_COLOR} />
                        <Text style={[styles.skipText, { color: SECONDARY_TEXT_COLOR }]}>-10s</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginHorizontal: 4 }}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration > 0 ? duration : 100}
                            disabled={duration === 0}
                            value={position}
                            onSlidingComplete={seekScroll}
                            minimumTrackTintColor={ACCENT_COLOR}
                            maximumTrackTintColor={'rgba(255,255,255,0.2)'}
                            thumbTintColor={ACCENT_COLOR}
                        />
                        <View style={styles.timeLabelContainer}>
                            <Text style={[styles.timeLabel, { color: SECONDARY_TEXT_COLOR }]}>
                                {formatTime(position)}
                            </Text>
                            <Text style={[styles.timeLabel, { color: SECONDARY_TEXT_COLOR }]}>
                                {duration > 0 ? formatTime(duration) : '--:--'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => skip(10)}
                        style={[styles.skipBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                    >
                        <Ionicons name="refresh" size={20} color={SECONDARY_TEXT_COLOR} style={{ transform: [{ scaleX: -1 }] }} />
                        <Text style={[styles.skipText, { color: SECONDARY_TEXT_COLOR }]}>+10s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={nextTrack}
                        style={[styles.skipBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="play-skip-forward" size={28} color={ACCENT_COLOR} />
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
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Queue</Text>
                            <TouchableOpacity
                                onPress={() => setShowTrackList(false)}
                                style={[styles.closeIcon, { backgroundColor: theme.border + '50' }]}
                            >
                                <Ionicons name="close" size={24} color={theme.text} />
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
                                            backgroundColor: item.url === currentUri ? theme.tint + '10' : 'transparent',
                                            borderColor: item.url === currentUri ? theme.tint + '30' : 'transparent'
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
                                    <Ionicons
                                        name={item.url === currentUri ? "volume-high" : "musical-note-outline"}
                                        size={18}
                                        color={item.url === currentUri ? theme.tint : theme.secondaryText}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text style={[
                                        styles.trackName,
                                        {
                                            color: item.url === currentUri ? theme.tint : theme.text,
                                            fontWeight: item.url === currentUri ? '700' : '500'
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
        bottom: 52, // Height of the TabBar roughly
        left: 0,
        right: 0,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
    },
    container: {
        paddingTop: 18,
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        borderTopWidth: 1.5,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    titleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.6,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconBtn: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 21,
    },
    playBtn: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 26,
        elevation: 10,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
    },
    slider: {
        height: 32,
    },
    skipBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    skipText: {
        fontSize: 9,
        fontWeight: '700',
        marginTop: -4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '75%',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        elevation: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -1.2,
    },
    closeIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1.5,
    },
    trackName: {
        fontSize: 16,
        flex: 1,
        letterSpacing: -0.3,
    },
    speedBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        minWidth: 50, // Added more width as requested
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedText: {
        fontSize: 13,
        fontWeight: '900',
    },
    timeLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -8,
        paddingHorizontal: 2,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

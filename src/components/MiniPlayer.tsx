import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    return (
        <View style={styles.outerContainer}>
            <BlurView
                intensity={isDark ? 80 : 100}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.container, { borderTopColor: theme.border }]}
            >
                <View style={styles.header}>
                    <View style={styles.titleInfo}>
                        <Ionicons
                            name="musical-note"
                            size={18}
                            color={theme.tint}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {trackName}
                        </Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleSpeedCycle} style={[styles.speedBtn, { backgroundColor: theme.tint + '15' }]}>
                            <Text style={[styles.speedText, { color: theme.tint }]}>
                                {playbackRate}x
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowTrackList(true)} style={styles.iconBtn}>
                            <Ionicons name="list" size={22} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePlayPause} style={[styles.playBtn, { backgroundColor: theme.tint }]}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={24}
                                    color="#fff"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        onPress={previousTrack}
                        style={styles.skipBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="play-skip-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => skip(-10)}
                        style={styles.skipBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                    >
                        <Ionicons name="backspace-outline" size={20} color={theme.secondaryText} />
                    </TouchableOpacity>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={seekScroll}
                        minimumTrackTintColor={theme.tint}
                        maximumTrackTintColor={theme.border}
                        thumbTintColor={theme.tint}
                    />

                    <TouchableOpacity
                        onPress={() => skip(10)}
                        style={styles.skipBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                    >
                        <Ionicons name="backspace-outline" size={20} color={theme.secondaryText} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={nextTrack}
                        style={styles.skipBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="play-skip-forward" size={24} color={theme.text} />
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
                                    onPress={() => {
                                        playSound(item.url, item.name, undefined, item.id);
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
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    container: {
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    titleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    playBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        elevation: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 8,
    },
    skipBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '75%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        elevation: 25,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -1,
    },
    closeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    trackName: {
        fontSize: 16,
        flex: 1,
    },
    speedBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedText: {
        fontSize: 13,
        fontWeight: '800',
    },
});

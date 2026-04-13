import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudio } from '@/src/context/AudioContext';
import { useFileDownloader } from '@/src/hooks/useFileDownloader';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DriveFile } from '../types';

interface FileListItemProps {
    file: DriveFile;
    onPlay?: (uri: string, title?: string, queue?: any[], fileId?: string) => void;
    onPause?: () => void;
    onSeek?: (value: number) => void;
    onAddNote?: (file: DriveFile) => void;
    isPlaying?: boolean;
    isCurrent?: boolean;
    isAudioLoading?: boolean;
    position?: number;
    duration?: number;
}

export const FileListItem: React.FC<FileListItemProps> = ({
    file,
    onPlay,
    onPause,
    onSeek,
    onAddNote,
    isPlaying,
    isCurrent,
    isAudioLoading,
    position = 0,
    duration = 0
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { downloaded, loading, download, remove, localUri } = useFileDownloader(file.name, file.url);
    const router = useRouter();
    const { playbackRate, setPlaybackRate } = useAudio();

    // Available playback speeds
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    const handleSpeedCycle = () => {
        const currentIndex = speeds.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackRate(speeds[nextIndex]);
    };

    const handleOpenPdf = async () => {
        if (localUri && downloaded) {
            if (Platform.OS === 'web') {
                Linking.openURL(localUri);
                return;
            }

            // Navigate to In-App PDF Viewer
            router.push({
                pathname: '/pdf-viewer',
                params: {
                    url: localUri,
                    remoteUrl: file.url,
                    name: file.name,
                },
            });
        }
    };

    const handleAudioPress = () => {
        if (!localUri || !downloaded) return;

        if (isCurrent && isPlaying && onPause) {
            onPause();
        } else if (onPlay) {
            // Pass the title manually using file.name and id
            onPlay(localUri, file.name, undefined, file.id);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.max(0, Math.floor((millis || 0) / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const renderAction = () => {
        if (loading) {
            return (
                <View style={styles.actionContainer}>
                    <ActivityIndicator size="small" color={theme.tint} />
                </View>
            );
        }

        if (!downloaded) {
            return (
                <TouchableOpacity onPress={download} style={styles.downloadButton}>
                    <Ionicons name="cloud-download-outline" size={24} color={theme.tint} />
                </TouchableOpacity>
            );
        }

        // File is downloaded
        return (
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => onAddNote?.(file)}
                    style={[styles.actionButton, { marginRight: 8 }]}
                >
                    <Ionicons name="create-outline" size={26} color={theme.tint} />
                </TouchableOpacity>

                {file.type === 'audio' ? (
                    <>
                        <TouchableOpacity onPress={handleAudioPress} style={styles.actionButton}>
                            {isAudioLoading && isCurrent ? (
                                <ActivityIndicator size="small" color={theme.tint} />
                            ) : (
                                <Ionicons
                                    name={isCurrent && isPlaying ? "pause-circle" : "play-circle"}
                                    size={40}
                                    color={theme.tint}
                                />
                            )}
                        </TouchableOpacity>
                        {isCurrent && (
                            <TouchableOpacity onPress={handleSpeedCycle} style={styles.speedButton}>
                                <Text style={[styles.speedButtonText, { color: theme.tint }]}>
                                    {playbackRate}x
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <TouchableOpacity onPress={handleOpenPdf} style={styles.actionButton}>
                        <Ionicons name="document-text-outline" size={32} color={theme.tint} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={remove} style={[styles.actionButton, { marginLeft: 15 }]}>
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        );
    };


    const renderContent = () => (
        <>
            <View style={styles.mainRow}>
                <View style={[styles.iconBox, { backgroundColor: isCurrent ? 'rgba(255,255,255,0.2)' : theme.border + '50' }]}>
                    <Ionicons
                        name={file.type === 'audio' ? 'play' : 'document'}
                        size={20}
                        color={isCurrent ? '#fff' : theme.icon}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: isCurrent ? '#fff' : theme.text }]} numberOfLines={1}>{file.name}</Text>
                    <Text style={[styles.status, { color: isCurrent ? 'rgba(255,255,255,0.8)' : theme.secondaryText }]}>
                        {downloaded ? 'Ready to listen' : 'Available for download'}
                    </Text>
                </View>
                {renderAction()}
            </View>

            {isCurrent && file.type === 'audio' && (
                <View style={styles.progressContainer}>
                    <View style={styles.controlsRow}>
                        <TouchableOpacity
                            onPress={() => onSeek && onSeek(Math.max(0, position - 10000))}
                            style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        >
                            <Ionicons name="refresh" size={18} color="#fff" />
                            <Text style={[styles.controlText, { color: '#fff' }]}>-10s</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1, marginHorizontal: 12 }}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration > 0 ? duration : 100}
                                disabled={duration === 0}
                                value={position}
                                onSlidingComplete={onSeek}
                                minimumTrackTintColor="#4ade80" // Bright green accent
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#4ade80"
                            />
                            <View style={styles.timeLabels}>
                                <Text style={[styles.timeText, { color: 'rgba(255,255,255,0.8)' }]}>{formatTime(position)}</Text>
                                <Text style={[styles.timeText, { color: 'rgba(255,255,255,0.8)' }]}>{duration > 0 ? formatTime(duration) : '--:--'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => onSeek && onSeek(duration > 0 ? Math.min(duration, position + 10000) : position + 10000)}
                            style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        >
                            <Ionicons name="refresh" size={18} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
                            <Text style={[styles.controlText, { color: '#fff' }]}>+10s</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </>
    );

    if (isCurrent) {
        return (
            <LinearGradient
                colors={['rgba(30, 27, 75, 0.4)', 'rgba(56, 189, 248, 0.08)', 'rgba(30, 27, 75, 0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.container,
                    {
                        borderBottomColor: 'rgba(56, 189, 248, 0.2)',
                        paddingVertical: 18,
                        marginHorizontal: 8,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: 'rgba(56, 189, 248, 0.1)',
                        marginTop: 4,
                        marginBottom: 4,
                    }
                ]}
            >
                {renderContent()}
            </LinearGradient>
        );
    }

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.background,
                borderBottomColor: theme.border
            }
        ]}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingVertical: 12,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
        marginRight: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    status: {
        fontSize: 12,
        marginTop: 2,
    },
    actionContainer: {
        width: 40,
        alignItems: 'center',
    },
    downloadButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    speedButton: {
        marginLeft: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        minWidth: 44,
        alignItems: 'center',
    },
    speedButtonText: {
        fontSize: 11,
        fontWeight: '800',
    },
    progressContainer: {
        paddingHorizontal: 16,
        marginTop: 12,
        paddingBottom: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    controlText: {
        fontSize: 9,
        fontWeight: '700',
        marginTop: -2,
    },
    slider: {
        height: 30,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -4,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
